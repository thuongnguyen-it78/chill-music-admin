import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons/';
import { Button, Card, Empty, Table, Tag } from 'antd';
import { statuses } from 'constants';
import { findInArr, findInArr1, formatDate } from 'utils';
import React, { Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { genderList } from 'constants';
import { roleList } from 'constants';
import { useQuery } from 'react-query';
import permissionAPI from 'api/permissionAPI';

function UserTable({ list, isLoading, pagination, onPageChange, onDelete }) {
  const {
    data,
    isLoading: permissionLoading,
    isError,
  } = useQuery(['permission'], () => permissionAPI.getAll({ limit: 1000 }), {
    select: (data) => data?.data,
  });

  const history = useHistory();
  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Loại người dùng',
      dataIndex: 'role',
      key: 'role',
      render: (value) => {
        return findInArr1(data || [], value, 'code', 'name');
      },
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      width: 150,
      key: 'gender',
      render: (value) => {
        return findInArr(genderList, value, 'name');
      },
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      width: 150,
      key: 'dateOfBirth',
      render: (value) => formatDate(value),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 150,
      key: 'createdAt',
      render: (value) => formatDate(value),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 150,
      key: 'isActive',
      render: (value) => {
        const status = findInArr(statuses, value);
        return <Tag color={status.color}>{status.name}</Tag>;
      },
    },
    {
      title: 'Hành động',
      width: 150,
      fixed: 'right',
      align: 'center',
      render: (value) => {
        return (
          <Fragment>
            <Button danger icon={<DeleteOutlined />} className="me-2" onClick={() => onDelete(value?._id)} />
            <Link
              to={{
                pathname: `/users/${value?._id}`,
              }}
            >
              <Button type="primary" icon={<EyeOutlined />} />
            </Link>
          </Fragment>
        );
      },
    },
  ];

  return (
    <Card
      title="Danh sách người dùng"
      extra={
        <Button icon={<PlusOutlined />} type="primary" onClick={() => history.push('/users/add')}>
          Thêm người dùng
        </Button>
      }
    >
      <Table
        locale={{
          emptyText: <Empty description="Không có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        }}
        dataSource={list || []}
        columns={columns}
        onChange={onPageChange}
        pagination={{
          total: pagination.total,
          pageSize: pagination.limit,
          current: pagination.page,
          position: ['topRight', 'bottomRight'],
          showTotal: (total, range) => `${total} người dùng | Từ ${range[0]} đến ${range[1]}`,
          showSizeChanger: false,
          showLessItems: true,
        }}
        scroll={{ x: 1500 }}
        loading={isLoading}
      />
    </Card>
  );
}

export default UserTable;
