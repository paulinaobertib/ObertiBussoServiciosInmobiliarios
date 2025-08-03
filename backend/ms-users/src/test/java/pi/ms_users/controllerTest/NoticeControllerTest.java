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
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.NoticeController;
import pi.ms_users.dto.NoticeDTO;
import pi.ms_users.dto.NoticeGetDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.INoticeService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SuppressWarnings("unused")
@WebMvcTest(NoticeController.class)
@Import({NoticeControllerTest.Config.class, WebSecurityConfig.class})
class NoticeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private INoticeService noticeService;

    @TestConfiguration
    static class Config {
        @Bean
        public INoticeService noticeService() {
            return Mockito.mock(INoticeService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    // casos de exito

    @Test
    void createNotice_success_shouldReturnOk() throws Exception {
        NoticeDTO dto = new NoticeDTO();
        dto.setUserId("adminUser");
        dto.setTitle("Title");
        dto.setDescription("Description");
        dto.setDate(LocalDateTime.now());

        when(noticeService.create(any(NoticeDTO.class)))
                .thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(multipart("/notices/create")
                        .file(new MockMultipartFile("mainImage", "image.jpg", "image/jpeg", "data".getBytes()))
                        .param("userId", "adminUser")
                        .param("title", "Title")
                        .param("description", "Description")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    void updateNotice_success_shouldReturnOk() throws Exception {
        NoticeDTO dto = new NoticeDTO();
        dto.setId(1L);
        dto.setUserId("adminUser");
        dto.setTitle("Updated Title");
        dto.setDescription("Updated Description");
        dto.setDate(LocalDateTime.now());

        when(noticeService.update(any(NoticeDTO.class)))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(multipart("/notices/update/1")
                        .file(new MockMultipartFile("mainImage", "image.jpg", "image/jpeg", "data".getBytes()))
                        .param("userId", "adminUser")
                        .param("title", "Updated Title")
                        .param("description", "Updated Description")
                        .param("date", LocalDateTime.now().toString())
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    void updateNotice_withoutImage_shouldReturnOk() throws Exception {
        when(noticeService.update(any(NoticeDTO.class)))
                .thenReturn(ResponseEntity.ok("Updated without image"));

        mockMvc.perform(multipart("/notices/update/1")
                        .param("userId", "adminUser")
                        .param("title", "Updated title")
                        .param("description", "Updated description")
                        .param("date", LocalDateTime.now().toString())
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated without image"));
    }

    @Test
    void deleteNotice_success_shouldReturnOk() throws Exception {
        when(noticeService.delete(1L))
                .thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/notices/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    void getById_success_shouldReturnNotice() throws Exception {
        NoticeGetDTO dto = new NoticeGetDTO();
        dto.setId(1L);
        dto.setUserId("adminUser");
        dto.setTitle("Title");
        dto.setDescription("Description");
        dto.setDate(LocalDateTime.of(2023, 1, 1, 12, 0));
        dto.setMainImage("https://storage.com/image.jpg");

        when(noticeService.getById(1L))
                .thenReturn(ResponseEntity.ok(dto));

        mockMvc.perform(get("/notices/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userId").value("adminUser"))
                .andExpect(jsonPath("$.title").value("Title"))
                .andExpect(jsonPath("$.description").value("Description"));
    }

    @Test
    void getAll_success_shouldReturnList() throws Exception {
        NoticeGetDTO dto = new NoticeGetDTO();
        dto.setId(1L);
        dto.setUserId("adminUser");
        dto.setTitle("Title");
        dto.setDescription("Description");
        dto.setMainImage("https://storage.com/image.jpg");
        dto.setDate(LocalDateTime.of(2023, 1, 1, 12, 0));

        when(noticeService.getAll())
                .thenReturn(ResponseEntity.ok(List.of(dto)));

        mockMvc.perform(get("/notices/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].userId").value("adminUser"));
    }

    @Test
    void search_success_shouldReturnList() throws Exception {
        NoticeGetDTO dto = new NoticeGetDTO();
        dto.setId(1L);
        dto.setUserId("adminUser");
        dto.setTitle("Title");
        dto.setDescription("Description");
        dto.setMainImage("https://storage.com/image.jpg");
        dto.setDate(LocalDateTime.of(2023, 1, 1, 12, 0));

        when(noticeService.search("Title"))
                .thenReturn(ResponseEntity.ok(List.of(dto)));

        mockMvc.perform(get("/notices/search")
                        .param("text", "Title"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Title"));
    }

    // casos de error

    @Test
    void createNotice_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(multipart("/notices/create")
                        .file(new MockMultipartFile("mainImage", "image.jpg", "image/jpeg", "data".getBytes()))
                        .param("userId", "adminUser")
                        .param("title", "Title")
                        .param("description", "Description"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createNotice_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(multipart("/notices/create")
                        .file(new MockMultipartFile("mainImage", "image.jpg", "image/jpeg", "data".getBytes()))
                        .param("userId", "user123")
                        .param("title", "Title")
                        .param("description", "Description")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateNotice_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(multipart("/notices/update")
                        .file(new MockMultipartFile("mainImage", "image.jpg", "image/jpeg", "data".getBytes()))
                        .param("id", "1")
                        .param("userId", "adminUser")
                        .param("title", "Updated title")
                        .param("description", "Updated description")
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateNotice_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(multipart("/notices/update/1")
                        .file(new MockMultipartFile("mainImage", "image.jpg", "image/jpeg", "data".getBytes()))
                        .param("id", "1")
                        .param("userId", "user123")
                        .param("title", "Title")
                        .param("description", "Description")
                        .param("date", LocalDateTime.now().toString())
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
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
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
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


