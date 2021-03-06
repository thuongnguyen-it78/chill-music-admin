import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Form, Input, message, Select, Upload } from 'antd';
import artistAPI from 'api/artistAPI';
import categoryAPI from 'api/categoryAPI';
import { IMAGE_API_URL, UPLOAD_SONG_API_URL } from 'config';
import { statuses } from 'constants';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { differentObject, formatDate, requiredLabel, unAccent } from 'utils';

function SongForm({ data = {}, onUpdate }) {
  const [form] = Form.useForm();
  const dataRef = useRef(null);
  const audioRef = useRef();

  const [changedData, setChangedData] = useState({});
  const [imageLoading, setImageLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const [mediaURL, setMediaURL] = useState(null);

  const { data: categoryList = [] } = useQuery(
    'categories',
    () => categoryAPI.getAll({ limit: 1000, isActive: true }),
    {
      select: (value) => value?.data,
    }
  );

  const { data: artistList = [], isLoading: artistLoading } = useQuery(
    'artists',
    () => artistAPI.getAll({ limit: 1000, isActive: true }),
    {
      select: (value) => value?.data,
    }
  );

  useEffect(() => {
    form.setFieldsValue(data);
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    setImageURL(data.imageURL);
    setMediaURL(data.mediaURL);
  }, [data]);

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

    if (payload.mediaURL) {
      payload.mediaURL = payload.mediaURL.fileList.slice(-1)[0].response.data.path;
    }
    payload.time = audioRef.current.duration;

    if (payload.artistIdList) {
      payload.artistList = payload.artistIdList;
      delete payload.artistIdList;
    }

    onUpdate(data._id, payload);
  };

  const handleResetForm = () => {
    form.resetFields();
    setChangedData({});
    setImageURL(data.imageURL);
    setMediaURL(data.mediaURL);
  };

  const uploadButton = (
    <div>
      {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>T???i l??n</div>
    </div>
  );

  const uploadButtonMedia = (
    <div>
      {mediaLoading ? <LoadingOutlined /> : <PlusOutlined />}
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

  const beforeUploadMedia = (file) => {
    const isVideo = file.type === 'audio/mpeg' || file.type === 'audio/ogg' || file.type === 'audio/wav';
    if (!isVideo) {
      message.error('You can only upload audio file!');
    }

    const isLt10M = file.size / 1024 / 1024 < 20;
    if (!isLt10M) {
      message.error('Image must smaller than 20MB!');
    }

    return isVideo && isLt10M;
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

  const handleChangeMedia = (info) => {
    if (info.file.status === 'uploading') {
      setMediaLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      // Get this url from response in real world.
      const mediaURL = info.file?.response?.data?.path;
      setMediaURL(mediaURL);
      setMediaLoading(false);
    }
  };

  return (
    <Form form={form} initialValues={data} onValuesChange={handleValuesChange} onFinish={handleUpdateClick}>
      <Card title="Chi ti???t b??i h??t">
        <Descriptions column={1} bordered className="feature-form song-form">
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
                disabled={data.userId}
              >
                {imageURL && !imageLoading ? (
                  <img src={imageURL} alt="avatar" style={{ width: '100%' }} />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('??m thanh')} className="upload-media">
            <Form.Item
              className="mb-0"
              name="mediaURL"
              rules={[{ required: true, message: 'Vui l??ng t???i l??n ??m thanh' }]}
            >
              <Upload
                name="song"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action={`${UPLOAD_SONG_API_URL}upload-song`}
                beforeUpload={beforeUploadMedia}
                onChange={handleChangeMedia}
                disabled={data.type === 1}
              >
                {mediaURL && !mediaLoading ? (
                  <audio controls ref={audioRef}>
                    <source src={mediaURL} type="audio/ogg" />
                  </audio>
                ) : (
                  uploadButtonMedia
                )}
              </Upload>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={requiredLabel('T??n')}>
            <Form.Item className="mb-0" name="name" rules={[{ required: true, message: 'Vui l??ng ??i???n t??n b??i h??t' }]}>
              <Input placeholder="T??n" disabled={data.type === 1} />
            </Form.Item>
          </Descriptions.Item>

          {data.type !== 1 && (
            <Descriptions.Item label={requiredLabel('Ca s??')}>
              <Form.Item
                className="mb-0"
                name="artistIdList"
                rules={[{ required: true, message: 'Vui l??ng ch???n ca s??' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Ch???n ca s??"
                  showSearch
                  loading={artistLoading}
                  filterOption={(input, option) =>
                    unAccent(option.children).toLowerCase().indexOf(unAccent(input.trim()).toLowerCase()) !== -1
                  }
                >
                  {artistList &&
                    artistList?.map((artist) => (
                      <Select.Option key={artist._id} value={artist._id}>
                        {artist.fullName}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Descriptions.Item>
          )}

          {data.type !== 1 && (
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
                  {categoryList &&
                    categoryList?.map((category) => (
                      <Select.Option key={category._id} value={category._id}>
                        {category.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Descriptions.Item>
          )}

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

          <Descriptions.Item label="L?????t nghe">
            <span>{data.view}</span>
          </Descriptions.Item>

          <Descriptions.Item label="ID ng?????i t???o">
            <span>{data.userId}</span>
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

SongForm.propTypes = {};

export default SongForm;
