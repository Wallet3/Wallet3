import Browser from '../screens/browser/Browser';
import React from 'react';

interface Props {
  initUrl: string;
  onHome?: () => void;
}

export default ({}: Props) => {
  return <Browser disableExtraFuncs pageId={Date.now()} />;
};
