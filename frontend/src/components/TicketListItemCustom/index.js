import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { green, grey, red, blue } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import Box from "@material-ui/core/Box";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { v4 as uuidv4 } from "uuid";

import RoomIcon from '@material-ui/icons/Room';
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import AndroidIcon from "@material-ui/icons/Android";
import VisibilityIcon from "@material-ui/icons/Visibility";
import TicketMessagesDialog from "../TicketMessagesDialog";
import DoneIcon from '@material-ui/icons/Done';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import contrastColor from "../../helpers/contrastColor";
import ContactTag from "../ContactTag";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
  },

  pendingTicket: {
    cursor: "unset",
  },
  queueTag: {
    background: "#FCFCFC",
    color: "#000",
    marginRight: 1,
    padding: 1,
    fontWeight: 'bold',
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
    fontSize: "0.8em",
    whiteSpace: "nowrap"
  },
  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  newMessagesCount: {
    position: "absolute",
    alignSelf: "center",
    marginRight: 8,
    marginLeft: "auto",
    top: "10px",
    left: "20px",
    borderRadius: 0,
  },
  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  connectionTag: {
    background: "green",
    color: "#FFF",
    marginRight: 1,
    padding: 1,
    fontWeight: 'bold',
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
    fontSize: "0.8em",
    whiteSpace: "nowrap"
  },
  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: "5px",
  },

  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: -21
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
    paddingRight: "0%",
    marginLeft: "5px",
  },


  badgeStyle: {
    color: "white",
    backgroundColor: green[500],
  },

  acceptButton: {
    position: "absolute",
    right: "108px",
  },


  acceptButton: {
    position: "absolute",
    left: "50%",
  },


  ticketQueueColor: {
    flex: "none",
    width: "8px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
  },

  ticketInfo: {
    position: "relative",
    top: -13
  },
  secondaryContentSecond: {
    display: 'flex',
    // marginTop: 5,
    //marginLeft: "5px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    flexDirection: "row",
    alignContent: "flex-start",
  },
  ticketInfo1: {
    position: "relative",
    top: 13,
    right: 0
  },
  Radiusdot: {
    "& .MuiBadge-badge": {
      borderRadius: 2,
      position: "inherit",
      height: 16,
      margin: 2,
      padding: 3
    },
    "& .MuiBadge-anchorOriginTopRightRectangle": {
      transform: "scale(1) translate(0%, -40%)",
    },

  }
}));

const TicketListItemCustom = ({ ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const { ticketId } = useParams();
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleAcceptTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });
      // if (isMounted.current) {
      //   setLoading(false);
      //   history.push(`/tickets/${ticket.uuid}`);
      // }

      let settingIndex;

      try {
          const { data } = await api.get("/settings/");
          settingIndex = data.filter((s) => s.key === "sendGreetingAccepted");
      } catch (err) {
          toastError(err);
      }

      if (settingIndex[0].value === "enabled" && !ticket.isGroup) {
          handleSendMessage(ticket.id);
      }
    } catch (err) {
      if (isMounted.current) {
        setLoading(false);
        history.push(`/tickets/${ticket.uuid}`);
      }
    }
  };

  const handleSendMessage = async (id) => {
    const msg = `{{ms}} *{{name}}*, meu nome é *${user?.name}* e agora vou prosseguir com seu atendimento!`;
    const message = {
        read: 1,
        fromMe: true,
        mediaUrl: "",
        body: `*Mensagem Automática:*\n${msg.trim()}`,
    };
    try {
        await api.post(`/messages/${id}`, message);
    } catch (err) {
        toastError(err);
    }
};

  return (
    <React.Fragment key={ticket.id}>
      {/* <TicketMessagesDialog
        open={openTicketMessageDialog}

        handleClose={() => setOpenTicketMessageDialog(false)}
        ticketId={ticket.id}
      ></TicketMessagesDialog> */}
      <ListItem
        dense
        button
        onClick={() => {
          if (ticket.status === "pending" || !ticket.queue) return;
          history.push(`/tickets/${ticket.uuid}`);
        }}
        selected={ticketId === String(ticket.id)}
        className={classes.ticket}
      >
        <Tooltip title={ticket.queue?.name?.toUpperCase() || i18n.t("ticketsList.noQueue")}>
          <span style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }} className={classes.ticketQueueColor}></span>
        </Tooltip>
        <ListItemAvatar>
          {ticket.status !== "pending" ?
            <Avatar
              style={{
                marginTop: "-20px",
                marginLeft: "-3px",
                width: "55px",
                height: "55px",
                borderRadius: "10%",
              }}
              src={ticket?.contact?.profilePicUrl}
            />
            :
            <Avatar
              style={{
                marginTop: "-30px",
                marginLeft: "0px",
                width: "50px",
                height: "50px",
                borderRadius: "10%",
              }}
              src={ticket?.contact?.profilePicUrl}
            />
          }
        </ListItemAvatar>
        <ListItemText
          primary={<Typography variant="body2">{ticket.contact.name}</Typography>}
        />
        {ticket.status === "pending" && ticket.queue && (
          <ButtonWithSpinner
            variant="contained"
            color="primary"
            className={classes.acceptButton}
            size="small"
            loading={loading}
            onClick={(e) => {
              e.stopPropagation(); // Impede que o evento de clique no ListItem seja acionado
              handleAcceptTicket(ticket.id);
            }}
          >
            {i18n.t("ticketsList.buttons.accept")}
          </ButtonWithSpinner>
        )}
      </ListItem>
      <Divider variant="inset" component="li" />
    </React.Fragment>
  );
};

export default TicketListItemCustom;
