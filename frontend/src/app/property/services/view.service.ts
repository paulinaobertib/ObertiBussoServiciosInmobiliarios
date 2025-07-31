import {
  ViewsByProperty,
  ViewsByPropertyType,
  ViewsByDay,
  ViewsByMonth,
  ViewsByNeighborhood,
  ViewsByNeighborhoodType,
  ViewsByStatus,
  ViewsByStatusAndType,
  ViewsByOperation,
  ViewsByRooms,
  ViewsByAmenity,
  UserViewDTO,
} from "../types/view";
import { api } from "../../../api";

export const createUserView = async (dto: UserViewDTO): Promise<void> => {
  try {
    await api.post("/properties/userViews/create", dto, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating user view:", error);
    throw error;
  }
};

export const getViewsByProperty = async (): Promise<ViewsByProperty> => {
  try {
    const resp = await api.get<ViewsByProperty>("/properties/view/property", {
      withCredentials: true,
    });
    return resp.data;
  } catch (error) {
    console.error("Error fetching views by property:", error);
    throw error;
  }
};

export const getViewsByPropertyType =
  async (): Promise<ViewsByPropertyType> => {
    try {
      const resp = await api.get<ViewsByPropertyType>("/properties/view/propertyType", {
        withCredentials: true,
      });
      return resp.data;
    } catch (error) {
      console.error("Error fetching views by property type:", error);
      throw error;
    }
  };

export const getViewsByDay = async (): Promise<ViewsByDay> => {
  try {
    const resp = await api.get<ViewsByDay>("/properties/view/day", {
      withCredentials: true,
    });
    return resp.data;
  } catch (error) {
    console.error("Error fetching views by day:", error);
    throw error;
  }
};

export const getViewsByMonth = async (): Promise<ViewsByMonth> => {
  try {
    const resp = await api.get<ViewsByMonth>("/properties/view/month", {
      withCredentials: true,
    });
    return resp.data;
  } catch (error) {
    console.error("Error fetching views by month:", error);
    throw error;
  }
};

export const getViewsByNeighborhood =
  async (): Promise<ViewsByNeighborhood> => {
    try {
      const resp = await api.get<ViewsByNeighborhood>("/properties/view/neighborhood", {
        withCredentials: true,
      });
      return resp.data;
    } catch (error) {
      console.error("Error fetching views by neighborhood:", error);
      throw error;
    }
  };

export const getViewsByNeighborhoodType =
  async (): Promise<ViewsByNeighborhoodType> => {
    try {
      const resp = await api.get<ViewsByNeighborhoodType>(
        "/properties/view/neighborhoodType",
        {
          withCredentials: true,
        }
      );
      return resp.data;
    } catch (error) {
      console.error("Error fetching views by neighborhood type:", error);
      throw error;
    }
  };

export const getViewsByStatus = async (): Promise<ViewsByStatus> => {
  try {
    const resp = await api.get<ViewsByStatus>("/properties/view/status", {
      withCredentials: true,
    });
    return resp.data;
  } catch (error) {
    console.error("Error fetching views by status:", error);
    throw error;
  }
};

export const getViewsByStatusAndType =
  async (): Promise<ViewsByStatusAndType> => {
    try {
      const resp = await api.get<ViewsByStatusAndType>("/properties/view/statusAndType", {
        withCredentials: true,
      });
      return resp.data;
    } catch (error) {
      console.error("Error fetching views by status and type:", error);
      throw error;
    }
  };

export const getViewsByOperation = async (): Promise<ViewsByOperation> => {
  try {
    const resp = await api.get<ViewsByOperation>("/properties/view/operation", {
      withCredentials: true,
    });
    return resp.data;
  } catch (error) {
    console.error("Error fetching views by operation:", error);
    throw error;
  }
};

export const getViewsByRooms = async (): Promise<ViewsByRooms> => {
  try {
    const resp = await api.get<ViewsByRooms>("/properties/view/rooms", {
      withCredentials: true,
    });
    return resp.data;
  } catch (error) {
    console.error("Error fetching views by rooms:", error);
    throw error;
  }
};

export const getViewsByAmenity = async (): Promise<ViewsByAmenity> => {
  try {
    const resp = await api.get<ViewsByAmenity>("/properties/view/amenity", {
      withCredentials: true,
    });
    return resp.data;
  } catch (error) {
    console.error("Error fetching views by amenity:", error);
    throw error;
  }
};
