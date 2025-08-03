import React from "react";
import { Modal } from "../../../shared/components/Modal";

export interface Info {
    title: string;
    Component: React.ComponentType<any>;
    componentProps?: Record<string, any>;
}

export interface Props {
    info: Info | null;
    close: () => void;
}

export const ModalItem = ({ info, close }: Props) => {
    if (!info) return null;

    const { title, Component, componentProps = {} } = info;

    return (
        <Modal open title={title} onClose={close}>
            <Component {...componentProps} onDone={close} />
        </Modal>
    );
}
