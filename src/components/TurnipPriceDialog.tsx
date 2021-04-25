import React from 'react';
import { observer } from "mobx-react"

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContextText from '@material-ui/core/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ITurnip, Time } from '../stores/TurnipPriceStore';
import { useStores } from '../stores';
import DialogContentText from '@material-ui/core/DialogContentText';

export const TurnipPriceDialog = observer((props) => {
  const [open, setOpen] = React.useState(false);
  const [morningTurnip, setMorningTurnip] = React.useState(props.morningTurnip);
  const [morningPrice, setMorningPrice] = React.useState('')
  const [originalMorningPrice, setOriginalMorningPrice] = React.useState('');
  const [noonTurnip, setNoonTurnip] = React.useState(props.noonTurnip);
  const [noonPrice, setNoonPrice] = React.useState('')
  const [originalNoonPrice, setOriginalNoonPrice] = React.useState('');
  const [morningPriceError, setMorningPriceError] = React.useState(false)
  const [noonPriceError, setNoonPriceError] = React.useState(false)
  
  const { turnipPriceStore: tps } = useStores();

  const resetErrors = () => {
    setMorningPriceError(false)
    setNoonPriceError(false)
  }

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


  const resetTurnip = (time: Time) => {
    if (time === 'morning') {
      setMorningTurnip({ day: morningTurnip.day, time: 'morning', price: originalMorningPrice })
    } else {
      setNoonTurnip({ day: noonTurnip.day, time: 'afternoon', price: originalNoonPrice })
    }
  }

  const handleClose = () => {
    if (morningPriceError) {
      setMorningPrice(originalMorningPrice)
      resetTurnip('morning')
    } else {
      setOriginalMorningPrice(morningTurnip.price)
      tps.updateTurnipPrice(morningTurnip)
    }
    if (noonTurnip !== undefined) {
      if (noonPriceError) {
        setNoonPrice(originalNoonPrice)
        resetTurnip('afternoon')
      } else {
        setOriginalNoonPrice(noonTurnip.price)
        tps.updateTurnipPrice(noonTurnip)
      }
    }
    setOpen(false)
    resetErrors()
  }
  const handleCancel = () => {
    resetTurnip('morning')
    updateTurnipPrice('morning', originalMorningPrice)
    if (!morningTurnip.day.includes('Sun')) {
      resetTurnip('afternoon')
      updateTurnipPrice('afternoon', originalNoonPrice)
    }
    setOpen(false)
    resetErrors()
  };

  const updateTurnipPrice = (time: Time, price: string) => {
    if (time === 'morning') {
      setMorningPrice(price)
    } else {
      setNoonPrice(price)
    }
    const p: number = parseInt(price)
    const parsed_turnip: ITurnip = {
      day: morningTurnip.day, // the day is the same for morning and noon turnip
      time: time,
      price: p
    }
    if (morningTurnip.day.includes('Sun')) {
      if ((p < 90 || 110 < p)) { 
        setMorningPriceError(true)
        return 
      } else {
        setMorningPriceError(false)
        setMorningTurnip(parsed_turnip)
      }
    } else {
      if ((p < 9 || 660 < p)) { 
        if (time === 'morning') {
          setMorningPriceError(true)
        }
        if (time === 'afternoon') {
          setNoonPriceError(true)
        }
        return 
      } else {
        if (time === 'morning') {
          setMorningPriceError(false)
          setMorningTurnip(parsed_turnip)
        }
        if (time === 'afternoon') {
          setNoonPriceError(false)
          setNoonTurnip(parsed_turnip)
        }
      }
    }
    
    if (time === 'morning') {
       if (!setMorningPriceError) setMorningTurnip(parsed_turnip)
    } else {
      if (!setNoonPriceError) setNoonTurnip(parsed_turnip)
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
        <DialogContentText>{morningTurnip.day}</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id={props.propKey}
          label="Price"
          type="number"
          value={morningPrice}
          onChange={(e) => {e.preventDefault(); updateTurnipPrice('morning', e.target.value)}}
          InputProps={{inputProps: { min: 0, max: 110}}}
          fullWidth
          error={morningPriceError}
          helperText={morningPriceError ? "Buy price must be between 90–110 Bells" : "Buy price 90–110 Bells"}
        />
      </DialogContent>
    )
  }

  const renderSellPriceDialog = () => {
    return (
      <DialogContent>
        <DialogContentText>{morningTurnip.day}</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id={props.propKey}
          label="Morning price"
          type="number"
          value={morningPrice}
          onChange={(e) => updateTurnipPrice('morning', e.target.value)}
          InputProps={{inputProps: { min: 0, max: 660}}}
          error={morningPriceError}
          helperText={morningPriceError ? "Sell price must be between 9–660 Bells" : "Sell price 9–660 Bells"}
          fullWidth
        />
        <TextField
          autoFocus={morningPrice !== '' ? true : false}
          margin="dense"
          id={props.propKey}
          label="Noon price"
          type="number"
          value={noonPrice}
          onChange={(e) => updateTurnipPrice('afternoon', e.target.value)}
          InputProps={{inputProps: { min: 0, max: 660}}}
          error={noonPriceError}
          helperText={noonPriceError ? "Sell price must be between 9–660 Bells" : "Sell price 9–660 Bells"}
          fullWidth
        />
      </DialogContent>
    )
  }

  return (
    <div key={props.tile_uuid}>
      {renderTurnipPriceContent()}
      <Dialog open={open} onClose={handleClose} aria-labelledby="turnip-price-dialog">
        <DialogTitle id="turnip-price-dialog">{morningTurnip.day.includes('Sun') ? "Set turnip buy price" : "Set turnip sell prices"}</DialogTitle>
        {morningTurnip.day.includes('Sun') ? renderSundayDialog() : renderSellPriceDialog()}
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