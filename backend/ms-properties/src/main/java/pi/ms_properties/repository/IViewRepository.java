package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.View;

@Repository
<<<<<<< HEAD
<<<<<<<< HEAD:backend/ms-properties/src/main/java/pi/ms_properties/repository/IViewRepository.java
public interface IViewRepository extends JpaRepository<View, Long> {
========
public interface ITypeRepository extends JpaRepository<Type, Long>, JpaSpecificationExecutor<Type> {
>>>>>>>> 3e204fefabdeff63be93827f2a2ee5b0d2ccc34e:backend/ms-properties/src/main/java/pi/ms_properties/repository/ITypeRepository.java
=======
public interface IViewRepository extends JpaRepository<View, Long> {
    @Modifying
    @Query("DELETE FROM View v WHERE v.property.id = ?1")
    void deleteAllByPropertyId(@Param("propertyId") Long propertyId);
>>>>>>> 3e204fefabdeff63be93827f2a2ee5b0d2ccc34e
}
