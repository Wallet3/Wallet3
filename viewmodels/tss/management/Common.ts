import { Service } from 'react-native-zeroconf';
import { atob } from 'react-native-quick-base64';

export const LanServices = {
  ShardsDistribution: 'shards-distribution',
  ShardsAggregation: 'shards-aggregation',
  RequestKeyRecovery: 'key-recovery-request',
  ShardsRedistribution: 'shards-redistribution',
};

export function handleRawService(service: Service) {
  try {
    service.txt.info = JSON.parse(atob(service.txt.info));
  } catch (error) {}

  if (!service.txt?.info) return {};

  switch (service.txt?.['func']) {
    case LanServices.ShardsDistribution:
      return { shardsDistribution: service };
    case LanServices.ShardsAggregation:
      return { shardsAggregation: service };
    case LanServices.RequestKeyRecovery:
      return { keyRecoveryRequestor: service };
    case LanServices.ShardsRedistribution:
      return { shardsRedistribution: service };
  }

  return {};
}
