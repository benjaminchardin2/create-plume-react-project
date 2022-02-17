import { getGlobalInstance } from 'plume-ts-di';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import MessageService from '../../../i18n/messages/MessageService';
import ActionStyle from '../../plume-admin-theme/action/ActionStyle';
import { SortElementProps } from '../../plume-admin-theme/list/ListProps';
import PlumeAdminTheme from '../../plume-admin-theme/PlumeAdminTheme';
import { AdminUserDetails } from '../api/AdminUserTypes';
import UsersListResults from '../components/UsersListResults';
import { checkValueForFilter, compare, filteredList } from '../utils/FilterUtils';
import { AdminUsersWithIndexedRolesType } from './AdminUsersWithIndexedRolesType';
import userFilters from './UserFilter';
import userSorts, { NAME_DESC } from './UserSort';

type Props = {
  usersWithRoles?: AdminUsersWithIndexedRolesType;
  usersPath: string,
  isUsersLoading: boolean,
};

export default function UsersList({ usersWithRoles, usersPath, isUsersLoading }: Props) {
  const messages = getGlobalInstance(MessageService).t();
  const theme = getGlobalInstance(PlumeAdminTheme);
  const history = useHistory();

  const [currentSorting, setCurrentSorting] = useState<SortElementProps>(NAME_DESC);
  const [currentUserFilters, setCurrentUserFilters] = useState<Map<string, string[]>>(new Map<string, string[]>());
  const [currentSearchBarFilter, setCurrentSearchBarFilter] = useState<string>();

  const applySearchBarFilter = (user: AdminUserDetails) => {
    if (!currentSearchBarFilter || currentSearchBarFilter === "") {
      return true;
    }
    return compare(user.lastName, currentSearchBarFilter)
      || compare(user.firstName, currentSearchBarFilter)
      || compare(user.userName, currentSearchBarFilter)
      || compare(user.email, currentSearchBarFilter)
  }

  const sortedAndFilteredList = () => {
    if (!usersWithRoles) {
      return [];
    }
    // creating a clone in order to leave the original order in the list wherever it is used
    const userList = usersWithRoles.users;
    return filteredList<AdminUserDetails>(userList, currentUserFilters, userFilters(usersWithRoles.roles))
      .filter(applySearchBarFilter)
      .sort(currentSorting.sortFunction);
  }

  return (
    <>
      <theme.pageTitle>{messages['user.title-list']}</theme.pageTitle>
      <theme.pageBloc>
        <theme.pageBlocColumn column="50">
          <theme.listSearchBar
            onSearch={(event: React.ChangeEvent<HTMLInputElement>) => {
              setCurrentSearchBarFilter(event.target.value);
            }}
          />
        </theme.pageBlocColumn>
        <theme.pageBlocColumn column="50">
          <theme.actionsContainer>
            <theme.actionButton
              iconName="add"
              style={ActionStyle.PRIMARY}
              onClick={() => {
                history.push(`${usersPath}/create`);
              }}
            >
              {messages['user.add']}
            </theme.actionButton>
          </theme.actionsContainer>
        </theme.pageBlocColumn>
      </theme.pageBloc>
      <theme.pageBloc>
        <theme.pageBlocColumn column="25">
          <theme.listObjectFilters
            filterMenuKey="user"
            filters={userFilters(usersWithRoles?.roles)}
            onFilterValueClicked={(filterElementKey: string, valueSelected: string, isChecked: boolean) => {
              setCurrentUserFilters(checkValueForFilter(filterElementKey, valueSelected, isChecked, currentUserFilters));
            }}
            selectedValues={currentUserFilters}
            rawList={usersWithRoles?.users || []}
          />
        </theme.pageBlocColumn>
        <theme.pageBlocColumn column="75">
          <UsersListResults
            userList={sortedAndFilteredList()}
            userRoles={usersWithRoles?.roles}
            usersPath={usersPath}
            sortConfiguration={{
              sortedObjectKey: 'user',
              sortPossibilities: userSorts(),
              defaultSortPossibility: NAME_DESC,
              onSort: (to: SortElementProps) => {
                setCurrentSorting(to);
              },
            }}
            isLoading={isUsersLoading}
          />
        </theme.pageBlocColumn>
      </theme.pageBloc>
    </>
  );
}
