<<<<<<< HEAD
public class ListNode
{
    public int val;
    public ListNode next;

    public ListNode(int val = 0, ListNode next = null)
    {
        this.val = val;
        this.next = next;
    }
}

public class Solution
{
    public ListNode MergeTwoLists(ListNode list1, ListNode list2)
    {
        if (list1 == null) return list2;
        if (list2 == null) return list1;

        ListNode newHead = new ListNode();
        newHead.val = Math.Min(list1.val, list2.val);
        ListNode last = newHead;

        while (list1.next != null || list2.next != null)
        {
            ListNode nowNode = new ListNode();
            last.next = nowNode;
            if (list1.val > list2.val)
            {
                nowNode.val = list2.val;
                if (list2.next != null)
                {
                    list2 = list2.next;
                }
            }
            else
            {
                nowNode.val = list1.val;
                if (list1.next != null)
                {
                    list1 = list1.next;
                }
            }

            last = nowNode;
        }

        return newHead;
=======
public class Solution {
    public int RemoveDuplicates(int[] nums) {

        int k = 1;

        for(int i = 1; i < nums.Length; i++){
            if(nums[i] != nums[i-1]){
                nums[k] = nums[i];
                k++;
            }
        }

        return k;
>>>>>>> 610d5d1 (0313)
    }
}
