import React from 'react';
import { observer } from "mobx-react"

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ITurnip, Time } from '../stores/TurnipPriceStore';
import { useStores } from '../stores';

export const TurnipSundayDialog = observer((props) => {
  // console.log(props)
  const { turnipPriceStore: tps } = useStores();
  // console.log("Turnip dialog", props.turnip.tp)
  const [turnip, setTurnip] = React.useState(props.turnip);
  const [open, setOpen] = React.useState(false);
  const [price, setPrice] = React.useState(turnip ? turnip.price : undefined);
  const [originalPrice, setOriginalPrice] = React.useState(turnip ? turnip.price : undefined);

  const handleClickOpen = () => {
    if (turnip.price === undefined) {
      setPrice(100)
      setTurnip(tps.addTurnipPrice(turnip.day, turnip.time, price))
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOriginalPrice(price)
    setOpen(false);
  };

  const handleCancel = () => {
    updatePrice(originalPrice)
    setOpen(false);
  };

  const updatePrice = (price: number | string) => {
    const p = (typeof price === 'string' ? parseInt(price) : price)
    props.onValueChange({
      day: props.turnip.day,
      time: props.turnip.time,
      price: price
    })
    setPrice(price)
  }

  return (
    <div>
      <div className={'turnip-buy-day'} onClick={handleClickOpen}>
        <span>Buy price: {price ? price + ' b': '?'}</span>
      </div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="turnip-price-dialog-sunday">
        <DialogTitle id="turnip-price-dialog-sunday">Set turnip prices</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id={props.propKey}
            label="Price"
            type="number"
            value={price}
            onChange={(e) => updatePrice(e.target.value)}
            fullWidth
          />
        </DialogContent>
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

export function TurnipDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open form dialog
      </Button> */}
      <Dialog open={open} onClose={handleClose} aria-labelledby="turnip-price-dialog">
        <DialogTitle id="turnip-price-dialog">Set turnip prices</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set turnip prices.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="turnip-price-morning"
            label="Price"
            type="email"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="turnip-price-noon"
            label="Price"
            type="email"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
