package com.example.Londery_management.Services;

import com.example.Londery_management.DTO.FullpaymentDetailsDTO;
import com.example.Londery_management.DTO.PaymentDTO;
import com.example.Londery_management.Models.Ordermodel;
import com.example.Londery_management.Models.Paymentmodel;
import com.example.Londery_management.Repo.OrderRepo;
import com.example.Londery_management.Repo.PaymentRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentsServices {

    @Autowired
    private PaymentRepo paymentRepo;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private ModelMapper modelMapper;
    public PaymentDTO createPayment(PaymentDTO paymentDTO) {
        System.out.println("Received PaymentDTO: " + paymentDTO);
        System.out.println("Method: " + paymentDTO.getMethod());
        System.out.println("Amount: " + paymentDTO.getAmount());
        System.out.println("OrderId: " + paymentDTO.getOrderId());
        
        // Validate required fields
        if (paymentDTO.getOrderId() == null) {
            throw new RuntimeException("Order ID is required");
        }
        if (paymentDTO.getMethod() == null || paymentDTO.getMethod().trim().isEmpty()) {
            throw new RuntimeException("Payment method is required");
        }
        if (paymentDTO.getAmount() == null) {
            throw new RuntimeException("Amount is required");
        }
        
        Ordermodel order = orderRepo.findById(paymentDTO.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order Not Found"));

        // Check if payment already exists for this order
        if (paymentRepo.existsByOrder(order)) {
            throw new RuntimeException("Payment already exists for this order");
        }

        // Map DTO to entity and save payment
        Paymentmodel payment = new Paymentmodel();
        try {
            payment.setMethod(Paymentmodel.Method.valueOf(paymentDTO.getMethod()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid payment method: " + paymentDTO.getMethod());
        }
        payment.setAmount(paymentDTO.getAmount());
        payment.setOrder(order);
        Paymentmodel savedPayment = paymentRepo.save(payment);

        order.setPayment(savedPayment);
        // Update order status to WAITING_FOR_PICKUP after successful payment
        order.setOrderState(Ordermodel.Status.WAITING_FOR_PICKUP);
        orderRepo.save(order);

        // Return DTO of saved payment
        PaymentDTO responseDTO = new PaymentDTO();
        responseDTO.setPaymentId(savedPayment.getPaymentId());
        responseDTO.setMethod(savedPayment.getMethod().name());
        responseDTO.setAmount(savedPayment.getAmount());
        responseDTO.setOrderId(savedPayment.getOrder().getOrderid());
        return responseDTO;
    }

   public List<FullpaymentDetailsDTO> getPaymentsByCustomerId(Long customerId) {

        List<Paymentmodel> uniquePayemt =  paymentRepo.findByOrder_Customer_Id(customerId);

        List<FullpaymentDetailsDTO> fullorderdetailsDTOS = new ArrayList<>();

        for (Paymentmodel payment : uniquePayemt) {
            FullpaymentDetailsDTO dto = new FullpaymentDetailsDTO();

            dto.setPaymentId(payment.getPaymentId());
            dto.setMethod(payment.getMethod().name());
            dto.setAmount(payment.getAmount());

            Ordermodel order = payment.getOrder();

            if (order != null) {
                dto.setOrderid(order.getOrderid());
                dto.setTotalAmount(order.getTotalAmount());
                dto.setItemWeight(order.getItemWeight());
                dto.setOrdertype(order.getOrdertype().name());
                dto.setOrderState(order.getOrderState().name());
                dto.setOrderdata(order.getOrderdata());

                // Londery pack info
                if (order.getLonderyPack() != null) {
                    dto.setLonderypackid(order.getLonderyPack().getLonderypacksmodelId());
                }

                // Customer info
                if (order.getCustomer() != null) {
                    dto.setId(order.getCustomer().getId());
                    dto.setFirstname(order.getCustomer().getFirstname());
                    dto.setLastname(order.getCustomer().getLastname());
                    dto.setEmail(order.getCustomer().getEmail());
                    dto.setPhoneNumber(order.getCustomer().getPhoneNumber());
                    dto.setAddress(order.getCustomer().getAddress());
                }
            }

            fullorderdetailsDTOS.add(modelMapper.map(dto, FullpaymentDetailsDTO.class));
        }

       return fullorderdetailsDTOS;
   }

    public List<FullpaymentDetailsDTO> showAllPayments() {
        List<Paymentmodel> payments = paymentRepo.findAll();

        List<FullpaymentDetailsDTO> paymentDetailsList = new ArrayList<>();

        for (Paymentmodel payment : payments) {
            FullpaymentDetailsDTO dto = new FullpaymentDetailsDTO();

            // Payment info
            dto.setPaymentId(payment.getPaymentId());
            dto.setMethod(payment.getMethod().name());
            dto.setAmount(payment.getAmount());

            // Order info
            Ordermodel order = payment.getOrder();
            if (order != null) {
                dto.setOrderid(order.getOrderid());
                dto.setTotalAmount(order.getTotalAmount());
                dto.setItemWeight(order.getItemWeight());
                dto.setOrdertype(order.getOrdertype().name());
                dto.setOrderState(order.getOrderState().name());
                dto.setOrderdata(order.getOrderdata());

                // Londery pack info
                if (order.getLonderyPack() != null) {
                    dto.setLonderypackid(order.getLonderyPack().getLonderypacksmodelId());
                }

                // Customer info
                if (order.getCustomer() != null) {
                    dto.setId(order.getCustomer().getId());
                    dto.setFirstname(order.getCustomer().getFirstname());
                    dto.setLastname(order.getCustomer().getLastname());
                    dto.setEmail(order.getCustomer().getEmail());
                    dto.setPhoneNumber(order.getCustomer().getPhoneNumber());
                    dto.setAddress(order.getCustomer().getAddress());
                }
            }

            paymentDetailsList.add(dto);
        }

        return paymentDetailsList;
    }

}
