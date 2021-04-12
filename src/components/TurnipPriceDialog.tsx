import React from 'react';
import { observer } from "mobx-react"

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ITurnip, Time } from '../stores/TurnipPriceStore';
import { useStores } from '../stores';

export const TurnipPriceDialog = observer((props) => {
  const [open, setOpen] = React.useState(false);
  const { turnipPriceStore: tps } = useStores();
  const [morningTurnip, setMorningTurnip] = React.useState(props.morningTurnip);
  const [morningPrice, setMorningPrice] = React.useState('')
  const [originalMorningPrice, setOriginalMorningPrice] = React.useState('');
  const [noonTurnip, setNoonTurnip] = React.useState(props.noonTurnip);
  const [noonPrice, setNoonPrice] = React.useState('')
  const [originalNoonPrice, setOriginalNoonPrice] = React.useState('');

  const handleClickOpen = () => {
    if (morningTurnip !== undefined && morningTurnip.price !== undefined) {
      setMorningPrice(morningTurnip.price)
      setOriginalMorningPrice(morningTurnip.price)
    }
    if (noonTurnip !== undefined && noonTurnip.price !== undefined) {
      setNoonPrice(noonTurnip.price)
      setOriginalNoonPrice(noonTurnip.price)
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOriginalMorningPrice(morningTurnip.price)
    if (noonTurnip !== undefined) {
      setOriginalNoonPrice(noonTurnip.price)
    }
    setOpen(false);
  };

  const resetTurnip = (time: Time) => {
    if (time === 'morning') {
      setMorningTurnip({ day: morningTurnip.day, time: 'morning', price: originalMorningPrice })
    } else {
      setMorningTurnip({ day: noonTurnip.day, time: 'afternoon', price: originalNoonPrice })
    }
  }

  const handleCancel = () => {
    resetTurnip('morning')
    updateTurnipPrice('morning', originalMorningPrice)
    if (!morningTurnip.day.includes('Sun')) {
      resetTurnip('afternoon')
      updateTurnipPrice('afternoon', originalNoonPrice)
    }
    setOpen(false);
  };

  const updateTurnipPrice = (time: Time, price: string) => {
    const p: number = parseInt(price) || undefined
    const parsed_turnip: ITurnip = {
      day: morningTurnip.day, // the day is the same for morning and noon turnip
      time: time,
      price: p
    }
    tps.updateTurnipPrice(parsed_turnip)
    // props.onValueChange(updated_turnip)
    if (time === 'morning') {
      setMorningTurnip(parsed_turnip)
      setMorningPrice(price)
    } else {
      setNoonTurnip(parsed_turnip)
      setNoonPrice(price)
    }
  }

  const renderTurnipPriceContent = () => {
    if (morningTurnip.day.includes('Sun')) {
      return (
        <div className={'turnip-buy-day'} onClick={handleClickOpen}>
          <span>Buy price: {morningTurnip.price ? morningTurnip.price + ' B' : '?'}</span>
        </div>
      )
    } else {
      return (
        <div className={'turnip-sell-day'} onClick={handleClickOpen}>
          <span>M: {morningTurnip.price ? morningTurnip.price + ' B' : '?'}</span><br />
          <span>N: {noonTurnip.price ? noonTurnip.price + ' B' : '?'}</span>
        </div>
      )
    }
  }

  const renderSundayDialog = () => {
    return (
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id={props.propKey}
          label="Price"
          type="number"
          value={morningPrice}
          onChange={(e) => updateTurnipPrice('morning', e.target.value)}
          fullWidth
        />
      </DialogContent>
    )
  }

  const renderOtherDialog = () => {
    return (
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id={props.propKey}
          label="Morning price"
          type="number"
          value={morningPrice}
          onChange={(e) => updateTurnipPrice('morning', e.target.value)}
          fullWidth
        />
        <TextField
          autoFocus
          margin="dense"
          id={props.propKey}
          label="Noon price"
          type="number"
          value={noonPrice}
          onChange={(e) => updateTurnipPrice('afternoon', e.target.value)}
          fullWidth
        />
      </DialogContent>
    )
  }

  return (
    <div key={props.tile_uuid}>
      {renderTurnipPriceContent()}
      <Dialog open={open} onClose={handleClose} aria-labelledby="turnip-price-dialog">
        <DialogTitle id="turnip-price-dialog">Set turnip prices</DialogTitle>
        {morningTurnip.day.includes('Sun') ? renderSundayDialog() : renderOtherDialog()}
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
})