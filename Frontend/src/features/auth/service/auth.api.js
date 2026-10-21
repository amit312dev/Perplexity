import axios from 'axios'
import { BACKEND_URL } from '../../../app/config'

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // Include cookies in requests
})

export async function register({email, username, password}){
    const response = await api.post('/api/auth/register', {email, username, password})
    return response.data
}

export async function login({email, password}){
    const response = await api.post('/api/auth/login', {email, password})
    return response.data
}   

export async function getMe(){
    const response = await api.get('/api/auth/me')
    return response.data
}       

