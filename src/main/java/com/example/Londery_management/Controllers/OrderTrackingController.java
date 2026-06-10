package com.example.Londery_management.Controllers;

import com.example.Londery_management.DTO.FullorderdetailsDTO;
import com.example.Londery_management.Models.Ordermodel;
import com.example.Londery_management.Repo.OrderRepo;
import com.example.Londery_management.Repo.PaymentRepo;
import com.example.Londery_management.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/API/V1/OrderTracking")
@CrossOrigin(origins = "*")
public class OrderTrackingController {

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PaymentRepo paymentRepo;

    // Get ALL customer orders (including PAID ones)
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getAllCustomerOrders(@PathVariable Long customerId) {
        try {
            List<Ordermodel> orders = orderRepo.findByCustomer_Id(customerId);
            List<FullorderdetailsDTO> result = orders.stream().map(order -> {
                FullorderdetailsDTO dto = new FullorderdetailsDTO();
                dto.setOrderid(order.getOrderid());
                dto.setOrderdata(order.getOrderdata());
                dto.setTotalAmount(order.getTotalAmount());
                dto.setItemWeight(order.getItemWeight());
                dto.setOrderType(order.getOrdertype().name());
                dto.setOrderState(order.getOrderState().name());
                dto.setPaymentStatus(paymentRepo.existsByOrder(order) ? "PAID" : "UNPAID");

                if (order.getCustomer() != null) {
                    dto.setCustomerid(order.getCustomer().getId());
                    dto.setFirstname(order.getCustomer().getFirstname());
                    dto.setLastname(order.getCustomer().getLastname());
                    dto.setEmail(order.getCustomer().getEmail());
                    dto.setPhoneNumber(order.getCustomer().getPhoneNumber());
                    dto.setAddress(order.getCustomer().getAddress());
                }

                if (order.getLonderyPack() != null) {
                    dto.setPackTitle(order.getLonderyPack().getPackTitle());
                    dto.setPackDescription(order.getLonderyPack().getPackDescription());
                    dto.setOneKGprice(order.getLonderyPack().getOneKGprice());
                }

                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching orders");
        }
    }

    // Admin updates order status
    @PutMapping("/status/{orderId}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody UpdateStatusRequest request) {
        try {
            Ordermodel order = orderRepo.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            order.setOrderState(Ordermodel.Status.valueOf(request.getStatus().toUpperCase()));
            orderRepo.save(order);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid status or order not found");
        }
    }
}

// Simple request class
class UpdateStatusRequest {
    private String status;
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
