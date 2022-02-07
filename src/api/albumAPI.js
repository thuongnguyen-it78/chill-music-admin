import axiosClient from './axiosClient';

const albumAPI = {
  getAll(params) {
    const url = '/albums';
    return axiosClient.get(url, { params });
  },

  get(id) {
    const url = `/albums/${id}`;
    return axiosClient.get(url);
  },

  getDetail(id) {
    const url = `/albums/detail/${id}`;
    return axiosClient.get(url);
  },

  add(data) {
    const url = '/albums';
    return axiosClient.post(url, data);
  },

  update(id, data) {
    const url = `/albums/${id}`;
    return axiosClient.patch(url, data);
  },

  delete(id) {
    const url = `/albums/${id}`;
    return axiosClient.delete(url);
  },
};

export default albumAPI;