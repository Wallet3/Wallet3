import { QuixoticApiKey } from '../../configs/secret';
import axios from 'axios';

export async function getNfts(owner: string, network: 'opt' | 'arb') {
  axios.get(`https://api.quixotic.io/api/v1/opt/assets/?owner=${owner}`, { headers: { 'X-API-KEY': QuixoticApiKey } });
}
