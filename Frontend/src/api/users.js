const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

// create a new file ".env" in the folder "Frontend", put your backend url in file ".env" like .env.example
export function fetchUsers() {
  return fetch(`${API_BASE_URL}/users`)
    .then(res => res.json());
}