import api from './api';

export const listTrainers = async () => {
  const res = await api.get('/pt/trainers');
  return res.data;
};

export const requestConnection = async (trainerId: string) => {
  const res = await api.post('/pt/connect', { trainerId });
  return res.data;
};

export const acceptConnection = async (id: string) => {
  const res = await api.post(`/pt/accept/${id}`);
  return res.data;
};

export const cancelConnection = async (id: string) => {
  const res = await api.post(`/pt/cancel/${id}`);
  return res.data;
};

export const getMessages = async (connectionId: string) => {
  const res = await api.get(`/pt/messages/${connectionId}`);
  return res.data;
};

export const sendMessage = async (connectionId: string, text: string) => {
  const res = await api.post(`/pt/messages/${connectionId}`, { text });
  return res.data;
};

export const listConnections = async () => {
  const res = await api.get('/pt/connections');
  return res.data;
};

export const listTrainerConnections = async () => {
  const res = await api.get('/pt/trainer/connections');
  return res.data;
};


