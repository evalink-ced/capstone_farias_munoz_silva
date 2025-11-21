import { useState, useEffect } from "react";

import { User } from "../types/types";

import { fetchAllUsers } from "@/api/user/user";

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTermState, setSearchTermState] = useState<string>(() => {
    return sessionStorage.getItem("lastSearchTerm") || "";
  });
  const setSearchTerm = (value: string) => {
    sessionStorage.setItem("lastSearchTerm", value);
    setSearchTermState(value);
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await fetchAllUsers();

        if (usersList) {
          setUsers(usersList);
          setFilteredUsers(usersList);
        }
        setLoading(false);
      } catch {
        setError("Error al cargar los usuarios");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTermState) {
      const term = searchTermState.toLowerCase();

      const filtered = users.filter((user) => {
        const match =
          user.first_name.toLowerCase().includes(term) ||
          user.last_name.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term) ||
          (user.cargo && user.cargo.toLowerCase().includes(term)) ||
          (typeof user.empresa === "string"
            ? user.empresa.toLowerCase().includes(term)
            : typeof user.empresa === "object" &&
              user.empresa !== null &&
              "name" in user.empresa &&
              user.empresa.name.toLowerCase().includes(term))
        return match;
      });

      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTermState, users]);

  return {
    users,
    filteredUsers,
    searchTerm: searchTermState,
    setSearchTerm,
    loading,
    error,
  };
};

export default useUsers;
