package pi.ms_properties.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Marca una propiedad como oculta para el público (no se muestra a usuarios no-admin),
 * sin afectar Wasi ni el estado/disponibilidad de la propiedad.
 *
 * <p>La clave es el id público de la propiedad: para las locales es su id real, y para las
 * de Wasi es el id sintético ({@code WasiMapper.SYNTHETIC_ID_BASE + idWasi}). Por eso NO hay
 * foreign key a {@code property}: una propiedad de Wasi no tiene fila local. Si existe la fila,
 * la propiedad está oculta; si no existe, se muestra (default visible).
 */
@Entity
@Table(name = "hidden_property")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HiddenProperty {

    @Id
    @Column(name = "property_id", nullable = false)
    private Long propertyId;
}
