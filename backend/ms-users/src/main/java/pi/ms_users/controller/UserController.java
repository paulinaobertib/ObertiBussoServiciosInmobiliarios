package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.User;
import pi.ms_users.service.impl.UserService;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/getById/{id}")
    public User findById(@PathVariable String id) {
        return userService.findById(id);
    }

    @PutMapping("/update/{id}")
    public User updatePhone(@PathVariable String id, @RequestParam String phone) {
        return userService.updatePhone(id, phone);
    }

}
