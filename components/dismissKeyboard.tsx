import { Keyboard, TouchableWithoutFeedback } from 'react-native';

import React from 'react';

export default ({ children }) => (
  <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);
