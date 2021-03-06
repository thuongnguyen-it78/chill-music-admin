import { DeleteOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';
import albumAPI from 'api/albumAPI';
import playlistAPI from 'api/playlistAPI';
import Breadcrumb from 'components/Breadcrumb';
import Error from 'components/Error';
import moment from 'moment';
import queryString from 'query-string';
import React, { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import { transformDateToString } from 'utils';
import PlaylistFilter from '../components/PlaylistFilter';
import PlaylistTable from '../components/PlaylistTable';

const defaultPagination = {
  page: 1,
  limit: 10,
};

const breadcrumb = [{ path: '', active: true, name: 'Playlist' }];

function ListPage(props) {
  const history = useHistory();
  const location = useLocation();

  const queryParams = useMemo(() => {
    const params = queryString.parse(location.search);
    const { isActive, q, type, status, created_from, created_to, used_from, used_to, limit, page } = params;
    return {
      ...params,
      q: q ? q : undefined,
      isActive: isActive ? (isActive === 'false' ? false : true) : undefined,
      type: type ? Number(type) : undefined,
      status: status ? Number(status) : undefined,
      created_from: created_from ? moment(created_from) : undefined,
      created_to: created_to ? moment(created_to) : undefined,
      used_from: used_from ? moment(used_from) : undefined,
      used_to: used_to ? moment(used_to) : undefined,
      limit: limit ? Number(limit) : defaultPagination.limit,
      page: page ? Number(page) : defaultPagination.page,
    };
  }, [location.search]);

  const handlePageChange = ({ current, pageSize }) => {
    handleFilterChange({ limit: pageSize, page: current });
  };

  const handleFilterChange = (newFilter) => {
    const filter = {
      ...queryParams,
      ...newFilter,
    };

    // clean data before sync to url
    const dateKeys = ['created_from', 'created_to', 'used_from', 'used_to'];
    dateKeys.forEach((dateKey) => {
      if (filter[dateKey]) {
        filter[dateKey] = transformDateToString(filter[dateKey]);
      }
    });

    // delete page key before sync to url except change page
    if (!newFilter.page) {
      filter.page = defaultPagination.page;
    }

    history.push({
      pathname: history.location.pathname,
      search: queryString.stringify(filter),
    });
  };

  const resetFilter = () => {
    const defaultFilter = {};

    history.push({
      pathname: history.location.pathname,
      search: queryString.stringify(defaultFilter),
    });
  };

  const { data = {}, isLoading, isError } = useQuery(['playlists', queryParams], () => playlistAPI.getAll(queryParams));
  const pagination = {
    page: queryParams.page,
    limit: queryParams.limit,
    total: data.pagination?.count,
  };

  // if (isError) {
  //   return <Error />;
  // }

  const queryClient = useQueryClient();

  const { mutate, isLoading: deleteLoading } = useMutation((id) => playlistAPI.delete(id), {
    onError: () => {
      message.error('X??a th???t b???i');
    },

    onSuccess: () => {
      message.success('X??a th??nh c??ng');
      queryClient.invalidateQueries('playlists');
    },
  });

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'B???n ch???c ch???n ?????ng ?? x??a?',
      icon: <DeleteOutlined style={{ color: '#ef5350' }} />,
      confirmLoading: deleteLoading,
      okText: '?????ng ??',
      cancelText: 'H???y b???',
      onOk: () => mutate(id),
    });
  };

  return (
    <div className="content-wrapper">
      <Breadcrumb routes={breadcrumb} />

      <div className="content-padding">
        <PlaylistFilter filter={queryParams} onFilterChange={handleFilterChange} onResetFilter={resetFilter} />
        <PlaylistTable
          list={data.data}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

ListPage.propTypes = {};

export default ListPage;
