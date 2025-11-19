package pi.ms_properties.service.interf;

public interface IAzureBlobPropertiesStorage {
    void uploadPropertyJson(Long id, String json);

    void deletePropertyJson(Long id);

    String getPropertyUrl(Long id);
}
