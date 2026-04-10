import axiosClient from "./axiosClient";

const eventApi = {
  createEvent: (data) => {
    return axiosClient.post("/game-data/events", data);
  },

  getAllEvents: () => {
    return axiosClient.get("/game-data/events");
  },

  getActiveEvents: () => {
    return axiosClient.get("/game-data/events/active");
  },

  getEventByEventId: (eventId) => {
    return axiosClient.get(`/game-data/events/by-event-id/${eventId}`);
  },

  getEventById: (id) => {
    return axiosClient.get(`/game-data/events/${id}`);
  },

  updateEvent: (eventId, data) => {
    return axiosClient.put(`/game-data/events/${eventId}`, data);
  },

  deleteEvent: (eventId) => {
    return axiosClient.delete(`/game-data/events/${eventId}`);
  },

  addRecipeToEvent: (eventId, recipeId) => {
    return axiosClient.post(`/game-data/events/${eventId}/recipes`, {
      recipeId,
    });
  },

  removeRecipeFromEvent: (eventId, recipeId) => {
    return axiosClient.delete(
      `/game-data/events/${eventId}/recipes/${recipeId}`,
    );
  },

  createEventRecipe: (data) => {
    return axiosClient.post("/game-data/event-recipes", data);
  },

  getAllEventRecipes: () => {
    return axiosClient.get("/game-data/event-recipes");
  },

  getEventRecipesByEventId: (eventId) => {
    return axiosClient.get(`/game-data/event-recipes/by-event-id/${eventId}`);
  },

  getEventRecipeByRecipeId: (recipeId) => {
    return axiosClient.get(`/game-data/event-recipes/by-recipe-id/${recipeId}`);
  },

  getEventRecipeById: (id) => {
    return axiosClient.get(`/game-data/event-recipes/${id}`);
  },

  updateEventRecipe: (recipeId, data) => {
    return axiosClient.put(`/game-data/event-recipes/${recipeId}`, data);
  },

  deleteEventRecipe: (recipeId) => {
    return axiosClient.delete(`/game-data/event-recipes/${recipeId}`);
  },

  createEventItem: (formData) => {
    return axiosClient.post("/game-data/event-items", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getAllEventItems: () => {
    return axiosClient.get("/game-data/event-items");
  },

  getActiveEventItems: () => {
    return axiosClient.get("/game-data/event-items/active");
  },

  getEventItemsByEventId: (eventId) => {
    return axiosClient.get(`/game-data/event-items/by-event-id/${eventId}`);
  },

  getEventItemByItemId: (itemId) => {
    return axiosClient.get(`/game-data/event-items/by-item-id/${itemId}`);
  },

  getEventItemById: (id) => {
    return axiosClient.get(`/game-data/event-items/${id}`);
  },

  updateEventItem: (itemId, formData) => {
    return axiosClient.put(`/game-data/event-items/${itemId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteEventItem: (itemId) => {
    return axiosClient.delete(`/game-data/event-items/${itemId}`);
  },
};

export default eventApi;
