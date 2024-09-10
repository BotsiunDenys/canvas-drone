import { useNavigate } from "react-router-dom";
import Button from "../../Button/Button";
import s from "./EndGameModal.module.css";

const EndGameModal = ({
  endGameInfo,
  score,
  setIsVisibleEndModal,
  setIsOpenGame,
}) => {
  const { type, isVisibleEndModal } = endGameInfo;
  const navigate = useNavigate();

  return (
    <div className={`${s.wrapper} ${isVisibleEndModal && s.visibleWrapper}`}>
      <p
        style={{
          color: type === "success" ? "rgb(17, 108, 17)" : "rgb(161, 22, 22)",
        }}
        className={s.text}
      >
        {type === "success"
          ? `You won with score: ${Math.round(score)}`
          : "You lost! The drone touched the wall."}
      </p>
      <Button
        onClick={() => {
          setIsVisibleEndModal({ type: "", isVisibleEndModal: false });
          setIsOpenGame(false);
          navigate("/");
        }}
        type="button"
        className={s.button}
      >
        OK
      </Button>
    </div>
  );
};

export default EndGameModal;
