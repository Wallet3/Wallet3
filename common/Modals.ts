import MessageKeys from './MessageKeys';

export async function openGlobalPasspad(req: {
  passLength?: number;
  closeOnOverlayTap?: boolean;
  onAutoAuthRequest: () => Promise<boolean>;
  onPinEntered: (pin: string) => Promise<boolean>;
}) {
  return new Promise<boolean>((resolve) => {
    let handled = false;

    const onAutoAuthRequestHook = async () => {
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
      ...req,
      onAutoAuthRequest: onAutoAuthRequestHook,
      onPinEntered: onPinEnteredHook,
      onClosed: onClosedHook,
    });
  });
}
