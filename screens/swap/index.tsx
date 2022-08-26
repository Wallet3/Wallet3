import React from 'react';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useRef } from 'react';
import { utils } from 'ethers';
import { Feather } from '@expo/vector-icons';
import { Text, Button, ListRenderItemInfo, Pressable, TextInput, View, TouchableOpacity } from 'react-native';
import { IToken } from '../../common/tokens';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import Networks from '../../viewmodels/Networks';
import App from '../../viewmodels/App';
import { DrawerScreenProps } from '@react-navigation/drawer';
import Swap from '../../viewmodels/Swap';
import { color } from 'react-native-reanimated';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import styles from '../land/styles';
import ContextMenu from 'react-native-context-menu-view';
import { INetwork } from '../../common/Networks';
import { title } from 'process';

type SwapStack = {
  Swap: undefined;
};

export default observer(({ navigation }: DrawerScreenProps<SwapStack, 'Swap'>) => {
  const { t } = i18n;
  const { backgroundColor, isLightMode, mode } = Theme;
  const { currentAccount } = App;
  const { current } = Networks;
  const fromAmountRef = useRef<HTMLInputElement>();

  // const TokenLabel = ({ symbol, name }: { symbol: string; name: string }) => {
  //   return (
  //     <div className={`token-label`} title={name}>
  //       <img src={CryptoIcons(symbol)} alt={name} />
  //       <span>{name}</span>
  //     </div>
  //   );
  // };

  const TokenMenu = ({
    selectedToken,
    tokens,
    onTokenSelected,
  }: {
    selectedToken: IToken;
    tokens: IToken[];
    onTokenSelected?: (token: IToken) => void;
  }) => {
    const renderItem = ({ item }: ListRenderItemInfo<INetwork>) => {
      return <View />;
    };

    return (
      // <Menu
      //   overflow="auto"
      //   styles={{ overflow: 'hidden', marginRight: '12px' }}
      //   style={{ marginTop: 1 }}
      //   menuButton={() => (
      //     <MenuButton className="menu-button">
      //       <TokenLabel symbol={selectedToken?.symbol ?? ''} name={selectedToken?.symbol ?? ''} />
      //     </MenuButton>
      //   )}
      // >
      //   {tokens.map((t) => {
      //     return (
      //       <MenuItem key={t.address} styles={{ padding: '8px 16px' }} onClick={(_) => onTokenSelected?.(t)}>
      //         <TokenLabel symbol={t.symbol} name={t.symbol} />
      //       </MenuItem>
      //     );
      //   })}
      // </Menu>
      <View />
    );
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        paddingBottom: 0,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          const value = utils.formatUnits(Swap.max, Swap.from?.decimals);
          Swap.setFromAmount(value);
        }}
      >
        <Text>Max: {utils.formatUnits(Swap.max, Swap.from?.decimals || 0)}</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row' }}>
        <TextInput
          numberOfLines={1}
          autoFocus
          defaultValue="0.00"
          value={Swap.fromAmount}
          onChangeText={(t) => Swap.setFromAmount(t)}
          autoCorrect={false}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
          <TokenMenu selectedToken={Swap.from!} tokens={Swap.fromList} onTokenSelected={(t) => Swap.selectFrom(t)} />
        </View>
      </View>

      <View style={{ marginTop: 24, flexDirection: 'row' }}>
        <TextInput defaultValue="0.00" numberOfLines={1} editable={false} value={Swap.forAmount} autoCorrect={false} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
          <TokenMenu selectedToken={Swap.for!} tokens={Swap.forList} onTokenSelected={(t) => Swap.selectFor(t)} />
        </View>
      </View>

      <View style={{ marginVertical: 24, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Text>{t('slippage')}:</Text>
          <TouchableOpacity onPress={() => Swap.setSlippage(0.5)}>
            <Text style={{ padding: 4, color: Swap.slippage === 0.5 ? 'blue' : 'lightblue' }}>{'0.5%'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Swap.setSlippage(1)}>
            <Text style={{ padding: 4, color: Swap.slippage === 1 ? 'blue' : 'lightblue' }}>{'1%'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Swap.setSlippage(2)}>
            <Text style={{ padding: 4, color: Swap.slippage === 2 ? 'blue' : 'lightblue' }}>{'2%'}</Text>
          </TouchableOpacity>
        </View>

        <Text>
          {t('modal-review-fee')}: {Swap.fee}%
        </Text>
      </View>

      {/* <div className="swap">
          <div className="max">
            <span
              onClick={(_) => {
                const value = utils.formatUnits(Swap.max, Swap.from?.decimals);
                Swap.setFromAmount(value);
                fromAmountRef.current.value = value;
              }}
            >
              Max: {utils.formatUnits(Swap.max, Swap.from?.decimals || 0)}
            </span>
          </div>

          <div className="swapbox from">
            <input
              ref={fromAmountRef}
              type="text"
              autoFocus
              placeholder="0.00"
              onChange={(e) => Swap.setFromAmount(e.target.value)}
            />

            {Swap.fromList.length > 0 ? (
              <TokenMenu selectedToken={Swap.from} tokens={Swap.fromList} onTokenSelected={(t) => Swap.selectFrom(t)} />
            ) : (
              <div className="empty-menu-placeholder" />
            )}
          </div>

          <div
            className="arrow"
            onClick={(_) => {
              Swap.interchange();
              fromAmountRef.current.value = '';
            }}
          >
            <Feather icon="arrow-down" size={12} />
          </div>

          <div className="swapbox">
            <input type="text" readOnly value={Swap.forAmount} />

            {Swap.forList.length > 0 ? (
              <TokenMenu selectedToken={Swap.for} tokens={Swap.forList} onTokenSelected={(t) => Swap.selectFor(t)} />
            ) : (
              <div className="empty-menu-placeholder" />
            )}
          </div>

          <div className="info">
            <div className="slippages">
              {t('Slippage')}:
              <span className={`${Swap.slippage === 0.5 ? 'active' : ''}`} onClick={(_) => Swap.setSlippage(0.5)}>
                0.5%
              </span>
              <span className={`${Swap.slippage === 1 ? 'active' : ''}`} onClick={(_) => Swap.setSlippage(1)}>
                1%
              </span>
              <span className={`${Swap.slippage === 2 ? 'active' : ''}`} onClick={(_) => Swap.setSlippage(2)}>
                2%
              </span>
            </div>
            <span>
              {t('Fee')}: {Swap.fee}%
            </span>
          </div>
        </div> */}

      {!Swap.approved && (
        <Button
          title={t('tx-type-approve')}
          disabled={!Swap.fromAmount || Swap.approving || Swap.fromList.length === 0}
          onPress={() => Swap.approve()}
        />
      )}

      {Swap.approved && (
        <Button title={t('home-tab-swap')} disabled={!Swap.isValid || Swap.swapping} onPress={() => Swap.swap()} />
      )}
    </View>
  );
});
