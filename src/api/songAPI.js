import axiosClient from './axiosClient';

const songAPI = {
  getAll(params) {
    const url = '/songs';
    return axiosClient.get(url, { params });
  },

  getAllByArtist(artistId) {
    const url = `/songs/from-artist/${artistId}`;
    return axiosClient.get(url);
  },

  updateView(id) {
    const url = `/songs/song-view/${id}`;
    return axiosClient.get(url);
  },

  get(id) {
    const url = `/songs/${id}`;
    return axiosClient.get(url);
  },

  getSongStatistic() {
    const url = `/songs/song-statistic`;
    return axiosClient.get(url);
  },

  add(data) {
    const url = '/songs';
    return axiosClient.post(url, data);
  },

  update(id, data) {
    const url = `/songs/${id}`;
    return axiosClient.patch(url, data);
  },

  delete(id) {
    const url = `/songs/${id}`;
    return axiosClient.delete(url);
  },
};

export default songAPI;