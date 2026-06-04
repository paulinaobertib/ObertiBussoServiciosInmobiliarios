package pi.ms_properties.dto.wasi;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WasiActivityEntryDTO {
    private Instant at;
    private String level;
    private String message;
}
