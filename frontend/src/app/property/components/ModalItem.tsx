// src/app/property/components/ModalItem.tsx
import React from "react";
import { Modal } from "../../shared/components/Modal";

export interface Info {
    /** Título que se muestra en la cabecera del modal */
    title: string;
    /** Componente a renderizar dentro del modal */
    Component: React.ComponentType<any>;
    /** Props que se pasarán al componente inyectado */
    componentProps?: Record<string, any>;
}

export interface ModalItemProps {
    info: Info | null;
    close: () => void;
}

export default function ModalItem({ info, close }: ModalItemProps) {
    if (!info) return null;

    const { title, Component, componentProps = {} } = info;

    return (
        <Modal open title={title} onClose={close}>
            {/* Inyecta cualquier componente con sus props y la callback onDone */}
            <Component {...componentProps} onDone={close} />
        </Modal>
    );
}
