package pi.ms_properties.service.interf;

import pi.ms_properties.domain.Storage;

public interface IAzureBlobStorage {
    String create(Storage storage);

    void delete(Storage storage);

    String getImageUrl(String imageName);
}
