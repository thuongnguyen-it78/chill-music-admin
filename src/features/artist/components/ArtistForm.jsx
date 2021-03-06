import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Descriptions, Form, Input, message, Select, Upload } from 'antd';
import categoryAPI from 'api/categoryAPI';
import { IMAGE_API_URL } from 'config';
import { genderList } from 'constants';
import { statuses } from 'constants';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { differentObject, formatDate, requiredLabel, unAccent } from 'utils';

function ArtistForm({ data = {}, onUpdate }) {
  const [form] = Form.useForm();
  const dataRef = useRef(null);
  const [changedData, setChangedData] = useState({});

  const [imageLoading, setImageLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [avatarURL, setAvatarURL] = useState(null);
  const [bannerURL, setBannerURL] = useState(null);

  useEffect(() => {
    setFieldsValue(data);
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    setAvatarURL(data.avatarURL);
    setBannerURL(data.bannerURL);
  }, [data]);

  const { data: categoryList = [] } = useQuery('category', () => categoryAPI.getAll({ limit: 1000, isActive: true }), {
    select: (value) => value?.data,
  });

  const handleValuesChange = (changedValues, allValues) => {
    const changedValue = differentObject(allValues, dataRef.current);
    if (changedValues.dateOfBirth && moment(changedValues.dateOfBirth).isSame(dataRef.current.dateOfBirth)) {
      delete changedValue.dateOfBirth;
    }
    setChangedData(changedValue);
  };

  const handleUpdateClick = () => {
    const payload = { ...changedData };
    setChangedData({});
    if (payload.avatarURL) {
      payload.avatarURL = payload.avatarURL.fileList.slice(-1)[0].response.data.path;
    }

    if (payload.bannerURL) {
      payload.bannerURL = payload.bannerURL.fileList.slice(-1)[0].response.data.path;
    }

    onUpdate(data._id, payload);
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

  const beforeUploadBanner = (file) => {
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

  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setImageLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      // Get this url from response in real world.
      const avatarURL = info.file?.response?.data?.path;
      setAvatarURL(avatarURL);
      setImageLoading(false);
    }
  };

  const handleChangeBanner = (info) => {
    if (info.file.status === 'uploading') {
      setBannerLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      // Get this url from response in real world.
      const avatarURL = info.file?.response?.data?.path;
      setBannerURL(avatarURL);
      setBannerLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>T???i l??n</div>
    </div>
  );

  const uploadButtonBanner = (
    <div>
      {bannerLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>T???i l??n</div>
    </div>
  );

  const handleResetForm = () => {
    setFieldsValue(data);
    setChangedData({});
    setAvatarURL(data.avatarURL);
    setBannerURL(data.bannerURL);
  };

  const setFieldsValue = (values) => {
    form.setFieldsValue({ ...values, dateOfBirth: values.dateOfBirth && moment(values.dateOfBirth) });
  };

  return (
    <Form form={form} onValuesChange={handleValuesChange} onFinish={handleUpdateClick}>
      <Card title="Chi ti???t ca s??">
        <Descriptions column={1} bordered className="feature-form artist-form">
          <Descriptions.Item label={requiredLabel('???nh ?????i di???n')}>
            <Form.Item className="mb-0" name="avatarURL" rules={[{ required: true, message: 'Vui l??ng ???nh ?????i di???n' }]}>
              <Upload
                name="image"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action={`${IMAGE_API_URL}images`}
                beforeUpload={beforeUpload}
                onChange={handleChange}
              >
                {avatarURL && !imageLoading ? (
                  <img src={avatarURL} alt="avatar" style={{ width: '100%' }} />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('???nh b??a')}>
            <Form.Item className="mb-0" name="bannerURL" rules={[{ required: true, message: 'Vui l??ng ch???n ???nh b??a' }]}>
              <Upload
                name="image"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action={`${IMAGE_API_URL}images`}
                beforeUpload={beforeUploadBanner}
                onChange={handleChangeBanner}
              >
                {bannerURL && !bannerLoading ? (
                  <img src={bannerURL} alt="avatar" style={{ width: '100%' }} />
                ) : (
                  uploadButtonBanner
                )}
              </Upload>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="ID">
            <span>{data._id}</span>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('T??n')}>
            <Form.Item className="mb-0" name="fullName" rules={[{ required: true, message: 'Vui l??ng nh???p t??n' }]}>
              <Input placeholder="T??n" />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('Gi???i t??nh')}>
            <Form.Item name="gender">
              <Select placeholder="Gi???i t??nh">
                {genderList.map((gender) => (
                  <Select.Option value={gender.id}>{gender.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('Th??? lo???i')}>
            <Form.Item
              className="mb-0"
              name="categoryId"
              rules={[{ required: true, message: 'Vui l??ng ch???n th??? lo???i' }]}
            >
              <Select
                placeholder="Ch???n th??? lo???i"
                showSearch
                filterOption={(input, option) =>
                  unAccent(option.children).toLowerCase().indexOf(unAccent(input.trim()).toLowerCase()) !== -1
                }
              >
                {categoryList.map((category) => (
                  <Select.Option key={category._id} value={category._id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('Ng??y sinh')}>
            <Form.Item
              name="dateOfBirth"
              className="mb-0"
              rules={[{ required: true, message: 'Vui l??ng ch???n ng??y sinh' }]}
            >
              <DatePicker
                disabledDate={(value) => {
                  if (value.valueOf() > moment().valueOf()) {
                    return true;
                  }
                }}
                placeholder="Ng??y sinh"
                style={{ display: 'block' }}
                format="DD/MM/YYYY"
                allowClear={false}
              />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('M?? t???')}>
            <Form.Item className="mb-0" name="description" rules={[{ required: true, message: 'Vui l??ng nh???p m?? t???' }]}>
              <Input.TextArea placeholder="M?? t???" />
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

ArtistForm.propTypes = {};

export default ArtistForm;
