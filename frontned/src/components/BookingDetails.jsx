import { Modal } from "rizzui/modal";

export default function BookingDetails({ booking, isOpen, onClose }) {
  console.log(booking);
  return <Modal isOpen={isOpen} onClose={onClose}></Modal>;
}
