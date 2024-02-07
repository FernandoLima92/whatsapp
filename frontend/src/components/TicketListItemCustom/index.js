import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";   
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

// Substitua os estilos de exemplo pelos seus estilos reais
const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
  },
  acceptButton: {
    position: "absolute",
    right: 10,
  },
  // Adicione mais estilos conforme necessário
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
    <React.Fragment>
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
          <Avatar src={ticket?.contact?.profilePicUrl} />
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
