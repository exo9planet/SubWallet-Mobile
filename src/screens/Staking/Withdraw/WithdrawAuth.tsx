import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { BasicTxResponse } from '@subwallet/extension-base/background/KoniTypes';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { BalanceField } from 'components/Field/Balance';
import { TextField } from 'components/Field/Text';
import PasswordModal from 'components/Modal/PasswordModal';
import { SubmitButton } from 'components/SubmitButton';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { WithdrawAuthProps } from 'routes/staking/withdrawAction';
import { ColorMap } from 'styles/color';
import {
  centerStyle,
  ContainerHorizontalPadding,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
} from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { getStakeWithdrawalTxInfo, submitStakeWithdrawal } from '../../../messaging';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  paddingTop: 16,
  flex: 1,
};

const ActionContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: -4,
  ...MarginBottomForSubmitButton,
};

const ButtonStyle: StyleProp<ViewStyle> = {
  marginHorizontal: 4,
  flex: 1,
};

const WithdrawAuth = ({ route: { params: withdrawParams } }: WithdrawAuthProps) => {
  const { withdrawAmount: amount, networkKey, selectedAccount, nextWithdrawalAction, targetValidator } = withdrawParams;

  const navigation = useNavigation<RootNavigationProps>();

  const network = useGetNetworkJson(networkKey);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [feeString, setFeeString] = useState('');

  const [isTxReady, setIsTxReady] = useState(false);
  const [balanceError, setBalanceError] = useState(false);

  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const [fee, feeToken] = useMemo((): [string, string] => {
    const res = feeString.split(' ');
    return [res[0], res[1]];
  }, [feeString]);

  const totalString = useMemo((): string => {
    return `${amount} ${selectedToken} + ${feeString}`;
  }, [amount, feeString, selectedToken]);

  const handleOpen = useCallback(() => {
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const goBack = useCallback(() => {
    navigation.navigate('Home', { tab: 'Staking' });
  }, [navigation]);

  const handleResponse = useCallback(
    (data: BasicTxResponse) => {
      if (balanceError) {
        setError('Your balance is too low to cover fees');
        setLoading(false);
      }

      if (data.passwordError) {
        setError(data.passwordError);
        setLoading(false);
      }

      if (data.txError) {
        setError('Encountered an error, please try again.');
        setLoading(false);
        return;
      }

      if (data.status !== undefined) {
        setLoading(false);
        setVisible(false);

        if (data.status) {
          navigation.replace('WithdrawStakeAction', {
            screen: 'WithdrawResult',
            params: {
              withdrawParams: withdrawParams,
              txParams: {
                txError: '',
                extrinsicHash: data.transactionHash as string,
                txSuccess: true,
              },
            },
          });
        } else {
          navigation.replace('WithdrawStakeAction', {
            screen: 'WithdrawResult',
            params: {
              withdrawParams: withdrawParams,
              txParams: {
                txError: 'Error submitting transaction',
                extrinsicHash: data.transactionHash as string,
                txSuccess: false,
              },
            },
          });
        }
      }
    },
    [balanceError, navigation, withdrawParams],
  );

  const onSubmit = useCallback(
    (password: string) => {
      setLoading(true);
      submitStakeWithdrawal(
        {
          address: selectedAccount,
          networkKey,
          password,
          action: nextWithdrawalAction,
          validatorAddress: targetValidator,
        },
        handleResponse,
      )
        .then(handleResponse)
        .catch(e => {
          console.log(e);
          setLoading(false);
        });
    },
    [handleResponse, networkKey, nextWithdrawalAction, selectedAccount, targetValidator],
  );

  useEffect(() => {
    getStakeWithdrawalTxInfo({
      address: selectedAccount,
      networkKey,
      action: nextWithdrawalAction,
      validatorAddress: targetValidator,
    })
      .then(resp => {
        setIsTxReady(true);
        setBalanceError(resp.balanceError);
        setFeeString(resp.fee);
      })
      .catch(console.error);

    return () => {
      setIsTxReady(false);
      setBalanceError(false);
      setFeeString('');
    };
  }, [networkKey, nextWithdrawalAction, selectedAccount, targetValidator]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.withdrawStakeAction}
      rightButtonTitle={i18n.common.cancel}
      onPressRightIcon={goBack}>
      <View style={ContainerStyle}>
        <ScrollView style={{ ...ScrollViewStyle }} contentContainerStyle={!isTxReady ? { ...centerStyle } : undefined}>
          {isTxReady ? (
            <>
              {!!targetValidator && (
                <AddressField
                  address={targetValidator}
                  label={i18n.withdrawStakeAction.validator}
                  showRightIcon={false}
                />
              )}
              <AddressField
                address={selectedAccount}
                label={i18n.common.account}
                showRightIcon={false}
                networkPrefix={network.ss58Format}
              />
              <BalanceField
                value={amount.toString()}
                decimal={0}
                token={selectedToken}
                si={formatBalance.findSi('-')}
                label={i18n.withdrawStakeAction.withdrawAmount}
                color={ColorMap.light}
              />
              <BalanceField
                value={fee}
                decimal={0}
                token={feeToken}
                si={formatBalance.findSi('-')}
                label={i18n.withdrawStakeAction.withdrawFee}
              />
              <TextField text={totalString} label={i18n.withdrawStakeAction.total} disabled={true} />
            </>
          ) : (
            <ActivityIndicator animating={true} size={'large'} />
          )}
        </ScrollView>
        <View style={ActionContainerStyle}>
          <SubmitButton
            title={i18n.common.cancel}
            style={ButtonStyle}
            backgroundColor={ColorMap.dark2}
            onPress={goBack}
          />
          <SubmitButton
            // isBusy={loading}
            title={i18n.common.continue}
            style={ButtonStyle}
            onPress={handleOpen}
          />
        </View>
        <PasswordModal
          onConfirm={onSubmit}
          visible={visible}
          closeModal={handleClose}
          isBusy={loading}
          error={error}
          setError={setError}
        />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(WithdrawAuth);