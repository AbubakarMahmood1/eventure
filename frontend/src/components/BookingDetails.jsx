import { Modal } from "rizzui/modal";

export default function BookingDetails({ booking, isOpen, onClose }) {
  return <Modal isOpen={isOpen} onClose={onClose}></Modal>;
}
