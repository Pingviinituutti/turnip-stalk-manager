import * as React from "react"
import { observer } from "mobx-react"

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
// import DialogContextText from '@material-ui/core/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useStores } from '../stores';
import DialogContentText from '@material-ui/core/DialogContentText';
import { ITurnip, Time } from './TurnipTypes';

interface PriceDialogProps {
  morningTurnip: ITurnip
  noonTurnip: ITurnip
  tileUuid: string
}

export const TurnipPriceDialog = observer((props: PriceDialogProps) => {
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
      setMorningPrice(morningTurnip.price.toFixed())
      setOriginalMorningPrice(morningTurnip.price.toFixed())
    }
    if (noonTurnip !== undefined && noonTurnip.price !== undefined) {
      setNoonPrice(noonTurnip.price.toFixed())
      setOriginalNoonPrice(noonTurnip.price.toFixed())
    }
    setOpen(true);
  };


  const resetTurnip = (time: Time) => {
    if (time === 'morning') {
      setMorningTurnip({ day: morningTurnip.day, time: 'morning', price: parseInt(originalMorningPrice) })
    } else {
      setNoonTurnip({ day: noonTurnip.day, time: 'afternoon', price: parseInt(originalNoonPrice) })
    }
  }

  const handleClose = () => {
    if (morningPriceError) {
      setMorningPrice(originalMorningPrice)
      resetTurnip('morning')
    } else {
      setOriginalMorningPrice(morningTurnip.price?.toFixed())
      tps.updateTurnipPrice(morningTurnip)
    }
    if (noonTurnip !== undefined) {
      if (noonPriceError) {
        setNoonPrice(originalNoonPrice)
        resetTurnip('afternoon')
      } else {
        setOriginalNoonPrice(noonTurnip.price?.toFixed())
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

  const handleKey = (e: React.KeyboardEvent) => {
    if(e.key === "Enter") {
      handleClose()
    }
    else if (e.key === "Escape") {
      // Works too without stopPropagation, however, an unnecessary update request to mobx is sent in that case.
      e.stopPropagation();
      handleCancel()
    }
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
          <h5>Buy price: </h5><p>{morningTurnip.price ? morningTurnip.price + ' B' : '?'}</p>
        </div>
      )
    } else {
      return (
        <div className={'turnip-sell-day'} onClick={handleClickOpen}>
          <div className={'morning'}>
            <h5>Morning price: </h5><p>{morningTurnip.price ? morningTurnip.price + ' B' : '?'}</p>
          </div>
          <div className={'noon'}>
            <h5>Noon price:    </h5><p>{noonTurnip.price ? noonTurnip.price + ' B' : '?'}</p>
          </div>
        </div>
      )
    }
  }

  const renderSundayDialog = () => {
    return (
      <DialogContent onKeyDown={handleKey}>
        <DialogContentText>{morningTurnip.day}</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id={props.tileUuid + 'morning'}
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
      <DialogContent onKeyDown={handleKey}>
        <DialogContentText>{morningTurnip.day}</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id={props.tileUuid + 'morning'}
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
          id={props.tileUuid + 'noon'}
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
    <div key={props.tileUuid}>
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