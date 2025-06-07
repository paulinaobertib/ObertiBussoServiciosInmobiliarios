package pi.ms_users.specificationTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.jpa.domain.Specification;
import pi.ms_users.domain.Notice;
import pi.ms_users.repository.INoticeRepository;
import pi.ms_users.specification.NoticeSpecification;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

@DataJpaTest
class NoticeSpecificationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private INoticeRepository noticeRepository;

    @BeforeEach
    void setUp() {
        Notice notice1 = new Notice();
        notice1.setUserId("user1");
        notice1.setDate(LocalDateTime.now());
        notice1.setTitle("Cambio en la ley de alquileres");
        notice1.setDescription("Se ha cambiado la ley de alquileres");

        Notice notice2 = new Notice();
        notice2.setUserId("user2");
        notice2.setDate(LocalDateTime.now());
        notice2.setTitle("Nuevo formato");
        notice2.setDescription("Se ha cambiado el formato");

        entityManager.persist(notice1);
        entityManager.persist(notice2);
        entityManager.flush();
    }

    // casos de exito

    @Test
    void whenSearchByExactTitle_shouldReturnMatchingNotice() {
        Specification<Notice> spec = NoticeSpecification.textSearch("alquileres");
        List<Notice> result = noticeRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getTitle()).containsIgnoringCase("alquileres");
    }

    @Test
    void whenSearchByPartialDescription_shouldReturnMatchingNotice() {
        Specification<Notice> spec = NoticeSpecification.textSearch("nuevo formato");
        List<Notice> result = noticeRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getDescription()).containsIgnoringCase("cambiado el formato");
    }

    @Test
    void whenSearchByCommonWord_shouldReturnMultipleNotices() {
        Specification<Notice> spec = NoticeSpecification.textSearch("se");
        List<Notice> result = noticeRepository.findAll(spec);

        assertThat(result).hasSizeGreaterThanOrEqualTo(2);
    }

    // casos de error

    @Test
    void whenSearchValueIsNull_shouldReturnAllNotices() {
        Specification<Notice> spec = NoticeSpecification.textSearch(null);
        List<Notice> result = noticeRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueIsBlank_shouldReturnAllNotices() {
        Specification<Notice> spec = NoticeSpecification.textSearch("   ");
        List<Notice> result = noticeRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueDoesNotMatch_shouldReturnEmptyList() {
        Specification<Notice> spec = NoticeSpecification.textSearch("inexistente");
        List<Notice> result = noticeRepository.findAll(spec);

        assertThat(result).isEmpty();
    }
}
