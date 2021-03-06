import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Form, Input, message, Select, Upload } from 'antd';
import categoryAPI from 'api/categoryAPI';
import songAPI from 'api/songAPI';
import { IMAGE_API_URL } from 'config';
import { statuses } from 'constants';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { differentObject, formatDate, renderArtistFromList, requiredLabel, unAccent } from 'utils';

function AlbumForm({ data = {}, onUpdate }) {
  const [form] = Form.useForm();
  const dataRef = useRef(null);
  const [changedData, setChangedData] = useState({});
  const [imageLoading, setImageLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const [bannerURL, setBannerURL] = useState(null);

  useEffect(() => {
    form.setFieldsValue(data);
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    setImageURL(data.imageURL);
    setBannerURL(data.bannerURL);
  }, [data]);

  const { data: categoryList = [] } = useQuery(
    'categories',
    () => categoryAPI.getAll({ limit: 1000, isActive: true }),
    {
      select: (value) => value?.data,
    }
  );

  const { data: songList = [] } = useQuery('songs', () => songAPI.getAll({ limit: 100000, isActive: true }), {
    select: (value) => value?.data,
  });

  const handleValuesChange = (changedValues, allValues) => {
    const changedValue = differentObject(allValues, dataRef.current);
    setChangedData(changedValue);
  };

  const handleUpdateClick = () => {
    const payload = { ...changedData };
    setChangedData({});
    if (payload.imageURL) {
      payload.imageURL = payload.imageURL.fileList.slice(-1)[0].response.data.path;
    }

    if (payload.bannerURL) {
      payload.bannerURL = payload.bannerURL.fileList.slice(-1)[0].response.data.path;
    }

    onUpdate(data._id, payload);
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

  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setImageLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      // Get this url from response in real world.
      const imageURL = info.file?.response?.data?.path;
      setImageURL(imageURL);
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
      const bannerURL = info.file?.response?.data?.path;
      setBannerURL(bannerURL);
      setBannerLoading(false);
    }
  };

  const handleResetForm = () => {
    form.resetFields();
    setImageURL(data.imageURL);
    setBannerURL(data.bannerURL);
    setChangedData({});
  };

  return (
    <Form form={form} initialValues={data} onValuesChange={handleValuesChange} onFinish={handleUpdateClick}>
      <Card title="Chi ti???t album">
        <Descriptions column={1} bordered className="feature-form album-form">
          <Descriptions.Item label="ID">
            <span>{data._id}</span>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('H??nh ???nh')}>
            <Form.Item className="mb-0" name="imageURL">
              <Upload
                name="image"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action={`${IMAGE_API_URL}images`}
                beforeUpload={beforeUpload}
                onChange={handleChange}
              >
                {imageURL && !imageLoading ? (
                  <img src={imageURL} alt="avatar" style={{ width: '100%' }} />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('???nh b??a')}>
            <Form.Item className="mb-0" name="bannerURL">
              <Upload
                name="image"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action={`${IMAGE_API_URL}images`}
                beforeUpload={beforeUpload}
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

          <Descriptions.Item label={requiredLabel('T??n')}>
            <Form.Item className="mb-0" name="name" rules={[{ required: true, message: 'Vui l??ng ??i???n t??n album' }]}>
              <Input placeholder="T??n" />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="T???ng s??? l?????ng b??i h??t">
            <span>{data.songList?.length || 0}</span>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('Danh s??ch b??i h??t')}>
            <Form.Item
              className="mb-0"
              name="songList"
              rules={[{ required: true, message: 'Vui l??ng ch???n danh s??ch b??i h??t' }]}
            >
              <Select
                mode="multiple"
                placeholder="Ch???n th??? lo???i"
                showSearch
                filterOption={(input, option) =>
                  unAccent(option.children).toLowerCase().indexOf(unAccent(input.trim()).toLowerCase()) !== -1
                }
              >
                {songList.map((song) => (
                  <Select.Option key={song._id} value={song._id}>
                    {`${song.name} ${renderArtistFromList(song.artistList)}`}
                  </Select.Option>
                ))}
              </Select>
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

          <Descriptions.Item label={requiredLabel('M?? t???')}>
            <Form.Item className="mb-0" name="description" rules={[{ required: true, message: 'Vui l??ng ??i???n m?? t???' }]}>
              <Input.TextArea placeholder="M?? t???" />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="L?????t nghe">
            <span>{data.view}</span>
          </Descriptions.Item>

          <Descriptions.Item label="ID ng?????i t???o">
            <span>{data.userID}</span>
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

AlbumForm.propTypes = {};

export default AlbumForm;
