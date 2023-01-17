import { isPhishing } from '../../common/apis/GoPlus';

export async function isUrlDangerous(url: string) {
    
  const phishing = await isPhishing(url);
}
