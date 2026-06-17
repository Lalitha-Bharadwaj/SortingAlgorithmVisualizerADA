with Ada.Real_Time; use Ada.Real_Time;

package body Heap_Sort is

   function Sort (Input_Arr : Element_Vectors.Vector) return Sort_Result is
      Start_Time  : constant Time := Clock;
      Result      : Sort_Result;
      Arr         : Element_Vectors.Vector := Input_Arr;
      N           : constant Natural := Natural (Arr.Length);
      Step_Count  : Integer := 0;
      Max_Steps   : constant Integer := 2000;

      procedure Add_Step (Action : Action_Kind; I, J : Integer) is
         Step : Trace_Step;
      begin
         if Step_Count >= Max_Steps then return; end if;
         Step_Count := Step_Count + 1;
         Step.Step_Num := Step_Count;
         Step.Action := Action;
         if I >= 0 then
            Step.Indices.Append (I);
         end if;
         if J >= 0 then
            Step.Indices.Append (J);
         end if;
         Step.Arr := Arr;
         Result.Trace.Append (Step);
      end Add_Step;

      procedure Heapify (Size, Root : Integer) is
         Largest : Integer := Root;
         Left    : constant Integer := 2 * Root;
         Right   : constant Integer := 2 * Root + 1;
      begin
         if Left <= Size then
            -- Compare Root and Left child
            Add_Step (Compare, Root - 1, Left - 1);
            Result.Comparisons := Result.Comparisons + 1;
            Result.Operations := Result.Operations + 1;

            if Arr.Element (Left) > Arr.Element (Largest) then
               Largest := Left;
            end if;
         end if;

         if Right <= Size then
            -- Compare Largest and Right child
            Add_Step (Compare, Largest - 1, Right - 1);
            Result.Comparisons := Result.Comparisons + 1;
            Result.Operations := Result.Operations + 1;

            if Arr.Element (Right) > Arr.Element (Largest) then
               Largest := Right;
            end if;
         end if;

         if Largest /= Root then
            -- Swap Root and Largest
            declare
               Temp : constant Integer := Arr.Element (Root);
            begin
               Arr.Replace_Element (Root, Arr.Element (Largest));
               Arr.Replace_Element (Largest, Temp);
            end;
            Result.Swaps := Result.Swaps + 1;
            Result.Operations := Result.Operations + 2; -- Two array writes

            -- Record swap
            Add_Step (Swap, Root - 1, Largest - 1);

            -- Recursive heapify
            Heapify (Size, Largest);
         end if;
      end Heapify;

   begin
      Result.Comparisons := 0;
      Result.Swaps := 0;
      Result.Operations := 0;

      if N > 0 then
         -- Build max heap
         for I in reverse 1 .. N / 2 loop
            Heapify (N, I);
         end loop;

         -- Extract elements from heap
         for I in reverse 2 .. N loop
            -- Swap root and current end
            declare
               Temp : constant Integer := Arr.Element (1);
            begin
               Arr.Replace_Element (1, Arr.Element (I));
               Arr.Replace_Element (I, Temp);
            end;
            Result.Swaps := Result.Swaps + 1;
            Result.Operations := Result.Operations + 2; -- Two array writes

            -- Record swap
            Add_Step (Swap, 0, I - 1);

            -- Extract element is now sorted
            Add_Step (Sorted, I - 1, -1);

            -- Heapify on reduced heap
            Heapify (I - 1, 1);
         end loop;

         -- Root element is now sorted
         Add_Step (Sorted, 0, -1);
      end if;

      -- Record elapsed time
      declare
         Elapsed : constant Time_Span := Clock - Start_Time;
         Elapsed_Sec : constant Duration := To_Duration (Elapsed);
      begin
         Result.Time_Ms := Float (Elapsed_Sec) * 1000.0;
      end;

      return Result;
   end Sort;

end Heap_Sort;
