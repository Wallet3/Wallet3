import React, { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { utils } from 'ethers';
import { Button, ListRenderItemInfo, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { IToken } from '../../common/tokens';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import Networks from '../../viewmodels/Networks';
import App from '../../viewmodels/App';
import { DrawerScreenProps } from '@react-navigation/drawer';
import Swap from '../../viewmodels/Swap';
import { INetwork } from '../../common/Networks';
import { Feather } from '@expo/vector-icons';

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
    onTokenSelected
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
      style={ {
        flex: 1,
        padding: 16,
        paddingBottom: 0,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor
      } }
    >


      <View style={ styles.swapbox }>
        <TouchableOpacity
          onPress={ () => {
            const value = utils.formatUnits(Swap.max, Swap.from?.decimals);
            Swap.setFromAmount(value);
          } }
        >
          <Text style={ styles.max }>Max: { utils.formatUnits(Swap.max, Swap.from?.decimals || 0) }</Text>
        </TouchableOpacity>
        <TextInput
          style={ styles.from }
          numberOfLines={ 1 }
          autoFocus
          defaultValue='0.00'
          value={ Swap.fromAmount }
          onChangeText={ (t) => Swap.setFromAmount(t) }
          autoCorrect={ false }
        />
        <View style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' } }>
          <TokenMenu selectedToken={ Swap.from! } tokens={ Swap.fromList } onTokenSelected={ (t) => Swap.selectFrom(t) } />
        </View>
      </View>


      <TouchableOpacity
        activeOpacity={1}
        style={ styles.arrow }
        onPress={ (_) => {
          Swap.interchange();
          Swap.fromAmount = '';
        } }
      >
        <Feather name='arrow-down' style={ styles.svg } />
      </TouchableOpacity>

      <View style={ styles.swapbox }>
        <TextInput style={ styles.from } defaultValue='0.00' numberOfLines={ 1 } editable={ false } value={ Swap.forAmount } autoCorrect={ false } />
        <View style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' } }>
          <TokenMenu selectedToken={ Swap.for! } tokens={ Swap.forList } onTokenSelected={ (t) => Swap.selectFor(t) } />
        </View>
      </View>

      <View style={ { marginVertical: 24, flexDirection: 'row', justifyContent: 'space-between' } }>
        <View style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' } }>
          <Text>{ t('slippage') }:</Text>
          <TouchableOpacity onPress={ () => Swap.setSlippage(0.5) }>
            <Text style={ { padding: 4, color: Swap.slippage === 0.5 ? 'blue' : 'lightblue' } }>{ '0.5%' }</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => Swap.setSlippage(1) }>
            <Text style={ { padding: 4, color: Swap.slippage === 1 ? 'blue' : 'lightblue' } }>{ '1%' }</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => Swap.setSlippage(2) }>
            <Text style={ { padding: 4, color: Swap.slippage === 2 ? 'blue' : 'lightblue' } }>{ '2%' }</Text>
          </TouchableOpacity>
        </View>

        <Text>
          { t('modal-review-fee') }: { Swap.fee }%
        </Text>
      </View>

      { !Swap.approved ? (
        <Button
          title={ t('tx-type-approve') }
          disabled={ !Swap.fromAmount || Swap.approving || Swap.fromList.length === 0 }
          onPress={ () => Swap.approve() }
        />
      ) : undefined }

      { Swap.approved ? (
        <Button title={ t('home-tab-swap') } disabled={ !Swap.isValid || Swap.swapping } onPress={ () => Swap.swap() } />
      ) : undefined }
    </View>
  );
});


const styles = StyleSheet.create({
  swapbox: {
    flexDirection: 'column',
    display: 'flex',
    fontSize: 10,
    borderRadius: 7,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#dfe8f9'
  },

  max: {
    fontSize: 10,
    marginBottom: -18
  },

  from: {
    paddingTop: 20
  },
  arrow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9,
    backgroundColor: 'white'
  },
  svg: {
    height: 24,
    width: 24,
    padding: 6,
    margin: -5,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#dfe8f9',
    backgroundColor: 'aliceblue'
  }


});

