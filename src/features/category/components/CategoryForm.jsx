import { Button, Card, Descriptions, Form, Input, message, Select, Upload } from 'antd';
import { statuses } from 'constants';
import React, { useEffect, useRef, useState } from 'react';
import { differentObject, formatDate, requiredLabel } from 'utils';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { IMAGE_API_URL } from 'config';

function CategoryForm({ data = {}, onUpdate }) {
  const [form] = Form.useForm();
  const dataRef = useRef(null);
  const [changedData, setChangedData] = useState({});
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerURL, setBannerURL] = useState(null);

  useEffect(() => {
    form.setFieldsValue(data);
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    setBannerURL(data.bannerURL);
  }, [data]);

  const handleValuesChange = (changedValues, allValues) => {
    const changedValue = differentObject(allValues, dataRef.current);
    setChangedData(changedValue);
  };

  const handleUpdateClick = () => {
    const payload = { ...changedData };
    setChangedData({});
    if (payload.bannerURL) {
      payload.bannerURL = payload.bannerURL.fileList.slice(-1)[0].response.data.path;
    }
    onUpdate(data._id, payload);
  };

  const handleResetForm = () => {
    form.resetFields();
    setChangedData({});
    setBannerURL(data.bannerURL);
  };

  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setBannerLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      // Get this url from response in real world.
      const bannerURL = info.file?.response?.data?.path;
      setBannerURL(bannerURL);
      setBannerLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }

    return isJpgOrPng && isLt2M;
  };

  const uploadButton = (
    <div>
      {bannerLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>T???i l??n</div>
    </div>
  );

  return (
    <Form form={form} initialValues={data} onValuesChange={handleValuesChange} onFinish={handleUpdateClick}>
      <Card title="Chi ti???t th??? lo???i">
        <Descriptions column={1} bordered className="feature-form category-form">
          <Descriptions.Item label="ID">
            <span>{data._id}</span>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('H??nh ???nh')}>
            <Form.Item
              className="mb-0"
              name="bannerURL"
              rules={[{ required: true, message: 'Vui l??ng ch???n h??nh ???nh' }]}
            >
              <Upload
                name="image"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action={`${IMAGE_API_URL}images`}
                beforeUpload={beforeUpload}
                onChange={handleChange}
              >
                {bannerURL && !bannerLoading ? (
                  <img src={bannerURL} alt="avatar" style={{ width: '100%' }} />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('T??n')}>
            <Form.Item className="mb-0" name="name" rules={[{ required: true, message: 'Vui l??ng ??i???n t??n' }]}>
              <Input placeholder="T??n" />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('Tr???ng th??i')}>
            <Form.Item
              className="mb-0"
              name="isActive"
              rules={[{ required: true, message: 'Vui l??ng ch???n tr???ng th??i' }]}
            >
              <Select placeholder="Tr???ng th??i">
                {statuses.map((status) => (
                  <Select.Option value={status.id}>{status.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('M?? t???')}>
            <Form.Item className="mb-0" name="description" rules={[{ required: true, message: 'Vui l??ng ??i???n m?? t???' }]}>
              <Input.TextArea placeholder="M?? t???" />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="Th???i gian t???o">
            <span>{formatDate(data.createdAt)}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Th???i gian c???p nh???t">
            <span>{formatDate(data.updatedAt)}</span>
          </Descriptions.Item>

          {Object.keys(changedData).length > 0 && (
            <Descriptions.Item>
              <div className="d-flex justify-content-end">
                <Button danger className="me-2" onClick={handleResetForm}>
                  H???y b???
                </Button>
                <Button type="primary" htmlType="submit">
                  C???p nh???t
                </Button>
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </Form>
  );
}

CategoryForm.propTypes = {};

export default CategoryForm;
