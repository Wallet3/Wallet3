import { IShardsDistributorConstruction, ShardsDistributor } from '../viewmodels/tss/ShardsDistributor';

import Authentication from '../viewmodels/auth/Authentication';
import MessageKeys from './MessageKeys';
import { ShardProvider } from '../viewmodels/tss/ShardProvider';
import { ShardsAggregator } from '../viewmodels/tss/ShardsAggregator';

export async function openGlobalPasspad(req: {
  passLength?: number;
  closeOnOverlayTap?: boolean;
  onAutoAuthRequest: () => Promise<boolean>;
  onPinEntered: (pin: string) => Promise<boolean>;
  fast?: boolean;
}) {
  if (req.fast && Authentication.biometricEnabled && (await req.onAutoAuthRequest())) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    let handled = false;

    const onAutoAuthHook = async () => {
      const success = await req.onAutoAuthRequest();
      success && resolve(success);
      handled = success;
      return success;
    };

    const onPinEnteredHook = async (pin: string) => {
      const success = await req.onPinEntered(pin);
      success && resolve(success);
      handled = success;
      return success;
    };

    const onClosedHook = () => {
      if (!handled) resolve(false);
    };

    PubSub.publish(MessageKeys.openGlobalPasspad, {
      closeOnOverlayTap: true,
      ...req,
      onPinEntered: onPinEnteredHook,
      onAutoAuthRequest: req.fast ? undefined : onAutoAuthHook,
      onClosed: onClosedHook,
    });
  });
}

export function openShardsDistributors(args: IShardsDistributorConstruction | { vm: ShardsDistributor }) {
  const vm: ShardsDistributor = args['vm'] ?? new ShardsDistributor(args as IShardsDistributorConstruction);
  PubSub.publish(MessageKeys.openShardsDistribution, { vm });
}

export function openShardsAggregator(vm: ShardsAggregator) {
  PubSub.publish(MessageKeys.openShardsAggregator, { vm });
}

export function openShardProvider(args: { vm: ShardProvider; onClosed?: () => void }) {
  PubSub.publish(MessageKeys.openShardProvider, args);
}
