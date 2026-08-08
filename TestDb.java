
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestDb {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/sales_management";
        String user = "postgres";
        String password = "postgres";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            String sql = "SELECT email, active, locked, password_hash FROM users WHERE email = 'admin@knoweb.lk'";
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                ResultSet rs = pstmt.executeQuery();
                if (rs.next()) {
                    System.out.println("Email: " + rs.getString("email"));
                    System.out.println("Active: " + rs.getBoolean("active"));
                    System.out.println("Locked: " + rs.getBoolean("locked"));
                    String storedHash = rs.getString("password_hash");
                    
                    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                    boolean match1 = encoder.matches("Admin1234", storedHash);
                    boolean match2 = encoder.matches("password", storedHash);
                    
                    System.out.println("Matches Admin1234: " + match1);
                    System.out.println("Matches password: " + match2);
                } else {
                    System.out.println("User not found!");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
