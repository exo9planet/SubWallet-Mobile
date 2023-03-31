import React from 'react';
import { StyleProp, View } from 'react-native';
import ActionButton from 'components/ActionButton';
import i18n from 'utils/i18n/i18n';
import { ArrowFatLineDown, PaperPlaneTilt, ShoppingCartSimple } from 'phosphor-react-native';
import { SwNumberProps } from 'components/design-system-ui/number';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { Number, Tag } from 'components/design-system-ui';
import { FontMedium } from 'styles/sharedStyles';

interface Props {
  totalValue: SwNumberProps['value'];
  totalChangeValue: SwNumberProps['value'];
  totalChangePercent: SwNumberProps['value'];
  isPriceDecrease: boolean;
  onOpenSendFund?: () => void;
  onOpenBuyTokens?: () => void;
  onOpenReceive?: () => void;
}

const actionButtonWrapper: StyleProp<any> = {
  paddingTop: 36,
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'center',
  paddingBottom: 25,
};

const containerStyle: StyleProp<any> = {
  height: 220,
  paddingHorizontal: 16,
  alignItems: 'center',
  marginTop: -2,
  paddingBottom: 2,
  marginBottom: -2,
};

export const TokenGroupsUpperBlock = ({
  isPriceDecrease,
  onOpenBuyTokens,
  onOpenReceive,
  onOpenSendFund,
  totalChangePercent,
  totalChangeValue,
  totalValue,
}: Props) => {
  return (
    <View style={containerStyle} pointerEvents="box-none">
      <BalancesVisibility value={totalValue} startWithSymbol subFloatNumber />

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Number
          textStyle={{ ...FontMedium }}
          decimal={0}
          value={totalChangeValue}
          prefix={isPriceDecrease ? '- $' : '+ $'}
        />
        <Tag style={{ marginLeft: 8 }} color={isPriceDecrease ? 'error' : 'success'} shape={'round'} closable={false}>
          <Number
            textStyle={{ ...FontMedium, lineHeight: 18 }}
            size={10}
            value={totalChangePercent}
            decimal={0}
            prefix={isPriceDecrease ? '-' : '+'}
            suffix={'%'}
          />
        </Tag>
      </View>

      <View style={[actionButtonWrapper]} pointerEvents="box-none">
        <ActionButton label={i18n.cryptoScreen.receive} icon={ArrowFatLineDown} onPress={onOpenReceive} />
        <ActionButton label={i18n.cryptoScreen.send} icon={PaperPlaneTilt} onPress={onOpenSendFund} />
        <ActionButton label={i18n.cryptoScreen.buy} icon={ShoppingCartSimple} onPress={onOpenBuyTokens} />
      </View>
    </View>
  );
};