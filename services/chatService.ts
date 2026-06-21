import api from './api';

export interface Message {
  id: string;
  association_id: string;
  sender_id: string;
  message_type: 'text' | 'photo' | 'system';
  content: string;
  created_at: string;
}

export const chatService = {
  getMessages: async (associationId: string): Promise<Message[]> => {
    const response = await api.get(`/chat/associations/${associationId}/messages`);
    return response.data.messages || [];
  },

  sendTextMessage: async (associationId: string, content: string): Promise<Message> => {
    const response = await api.post(`/chat/associations/${associationId}/messages`, {
      content,
    });
    return response.data;
  },

  sendPhotoMessage: async (associationId: string, photo: any): Promise<Message> => {
    const formData = new FormData();
    formData.append('photo', photo);

    const response = await api.post(
      `/chat/associations/${associationId}/messages/photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
