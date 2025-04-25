package pi.ms_properties.service.interf;

import pi.ms_properties.domain.Storage;

public interface IAzureBlobStorage {
    public String create(Storage storage);

    public void delete(Storage storage);
}
