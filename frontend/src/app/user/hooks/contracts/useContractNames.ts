// src/app/user/hooks/useContractNames.ts
import { useState, useEffect } from "react";
import { getUserById } from "../../services/user.service";
import type { User } from "../../types/user";
import { getPropertyById } from "../../../property/services/property.service";
import type { Property } from "../../../property/types/property";

export function useContractNames(userId: string, propertyId: number) {
  const [userName, setUserName] = useState<string>("");
  const [propertyName, setPropertyName] = useState<string>("");

  useEffect(() => {
    let alive = true;
    getUserById(userId)
      .then((resp) => {
        if (alive) {
          const { firstName, lastName } = resp.data as User;
          setUserName(`${firstName} ${lastName}`);
        }
      })
      .catch(() => alive && setUserName(""));
    return () => {
      alive = false;
    };
  }, [userId]);

  useEffect(() => {
    let alive = true;
    getPropertyById(propertyId)
      .then((prop) => {
        if (alive) setPropertyName((prop as Property).title);
      })
      .catch(() => alive && setPropertyName(""));
    return () => {
      alive = false;
    };
  }, [propertyId]);

  return { userName, propertyName };
}
