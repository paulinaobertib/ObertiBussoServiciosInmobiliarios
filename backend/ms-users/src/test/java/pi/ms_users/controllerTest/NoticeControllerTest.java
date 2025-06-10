package pi.ms_users.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.NoticeController;
import pi.ms_users.domain.Notice;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.impl.NoticeService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NoticeController.class)
@Import({NoticeControllerTest.Config.class, WebSecurityConfig.class})
class NoticeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NoticeService noticeService;

    @TestConfiguration
    static class Config {
        @Bean
        public NoticeService noticeService() {
            return Mockito.mock(NoticeService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    // casos de exito

    @Test
    void createNotice_success_shouldReturnOk() throws Exception {
        Notice notice = new Notice();
        notice.setId(1L);
        notice.setUserId("adminUser");
        notice.setDate(LocalDateTime.now());
        notice.setTitle("Title");
        notice.setDescription("Description");

        when(noticeService.create(any(Notice.class)))
                .thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/notices/create")
                        // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notice)))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    void updateNotice_success_shouldReturnOk() throws Exception {
        Notice notice = new Notice();
        notice.setId(1L);
        notice.setUserId("adminUser");
        notice.setDate(LocalDateTime.now());
        notice.setTitle("Updated Title");
        notice.setDescription("Updated Description");

        when(noticeService.update(any(Notice.class)))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/notices/update")
                        // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notice)))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    void deleteNotice_success_shouldReturnOk() throws Exception {
        when(noticeService.delete(1L))
                .thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/notices/delete/1")
                        // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    void getById_success_shouldReturnNotice() throws Exception {
        Notice notice = new Notice();
        notice.setId(1L);
        notice.setUserId("adminUser");
        notice.setDate(LocalDateTime.now());
        notice.setTitle("Title");
        notice.setDescription("Description");

        when(noticeService.getById(1L))
                .thenReturn(ResponseEntity.ok(notice));

        mockMvc.perform(get("/notices/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userId").value("adminUser"))
                .andExpect(jsonPath("$.title").value("Title"))
                .andExpect(jsonPath("$.description").value("Description"));
    }

    @Test
    void getAll_success_shouldReturnList() throws Exception {
        Notice notice = new Notice();
        notice.setId(1L);
        notice.setUserId("adminUser");
        notice.setDate(LocalDateTime.now());
        notice.setTitle("Title");
        notice.setDescription("Description");

        when(noticeService.getAll())
                .thenReturn(ResponseEntity.ok(List.of(notice)));

        mockMvc.perform(get("/notices/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].userId").value("adminUser"));
    }

    @Test
    void search_success_shouldReturnList() throws Exception {
        Notice notice = new Notice();
        notice.setId(1L);
        notice.setUserId("adminUser");
        notice.setDate(LocalDateTime.now());
        notice.setTitle("Title");
        notice.setDescription("Description");

        when(noticeService.search("Title"))
                .thenReturn(ResponseEntity.ok(List.of(notice)));

        mockMvc.perform(get("/notices/search")
                        .param("text", "Title"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Title"));
    }

    // casos de error

    @Test
    void createNotice_unauthorized_shouldReturn401() throws Exception {
        Notice notice = new Notice();
        notice.setUserId("adminUser");
        notice.setDate(LocalDateTime.now());
        notice.setTitle("Test title");
        notice.setDescription("Test description");

        mockMvc.perform(post("/notices/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notice)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createNotice_forbidden_shouldReturn403() throws Exception {
        Notice notice = new Notice();
        notice.setUserId("user123");
        notice.setDate(LocalDateTime.now());
        notice.setTitle("Title");
        notice.setDescription("Description");

        mockMvc.perform(post("/notices/create")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notice)))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateNotice_unauthorized_shouldReturn401() throws Exception {
        Notice notice = new Notice();
        notice.setId(1L);
        notice.setUserId("adminUser");
        notice.setDate(LocalDateTime.now());
        notice.setTitle("Updated title");
        notice.setDescription("Updated description");

        mockMvc.perform(put("/notices/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notice)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateNotice_forbidden_shouldReturn403() throws Exception {
        Notice notice = new Notice();
        notice.setId(1L);
        notice.setUserId("user123");
        notice.setDate(LocalDateTime.now());
        notice.setTitle("Title");
        notice.setDescription("Description");

        mockMvc.perform(put("/notices/update")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notice)))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteNotice_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(delete("/notices/delete/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteNotice_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(delete("/notices/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteNotice_notFound_shouldReturn404() throws Exception {
        when(noticeService.delete(999L))
                .thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(delete("/notices/delete/999")
                        // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void getById_notFound_shouldReturn404() throws Exception {
        when(noticeService.getById(999L))
                .thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/notices/getById/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void search_noResults_shouldReturnEmptyList() throws Exception {
        when(noticeService.search("nonexistent"))
                .thenReturn(ResponseEntity.ok(List.of()));

        mockMvc.perform(get("/notices/search")
                        .param("text", "nonexistent"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }
}

